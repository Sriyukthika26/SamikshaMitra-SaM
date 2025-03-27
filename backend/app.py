import os
import json
import re
import mimetypes
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import fitz  # for PDF processing
from PIL import Image
import cv2
from moviepy.video.io.VideoFileClip import VideoFileClip
import google.generativeai as genai
from threading import Thread, Lock
from queue import Queue
import uuid
import time

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_FILES'] = 10  # Maximum number of files allowed

# Evaluation queue and results storage
evaluation_queue = Queue()
results_store = {}
results_lock = Lock()

class GeminiService:
    def __init__(self):
        load_dotenv()
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash-latest')

    def extract_audio(self, video_path, output_audio_path="audio.mp3"):
        try:
            video = VideoFileClip(video_path)
            video.audio.write_audiofile(output_audio_path)
            return output_audio_path
        except Exception as e:
            return f"Error extracting audio: {str(e)}"
        
    def extract_key_frames(self, video_path, frame_interval=5, output_folder="frames"):
        try:
            os.makedirs(output_folder, exist_ok=True)
            cap = cv2.VideoCapture(video_path)
            frame_count = 0
            frame_list = []
            fps = cap.get(cv2.CAP_PROP_FPS) or 1
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                if frame_count % (frame_interval * int(fps)) == 0:
                    frame_path = os.path.join(output_folder, f"frame_{frame_count}.jpg")
                    cv2.imwrite(frame_path, frame)
                    frame_list.append(frame_path)
                frame_count += 1
            cap.release()
            return frame_list if frame_list else "Error extracting frames."
        except Exception as e:
            return f"Error processing video: {str(e)}"
        
    def describe_video(self, video_path):
        try:
            audio_path = self.extract_audio(video_path)
            if "Error" in audio_path:
                return audio_path

            with open(audio_path, "rb") as audio_file:
                audio_data = audio_file.read()

            frame_paths = self.extract_key_frames(video_path)
            if isinstance(frame_paths, str) and "Error" in frame_paths:
                return frame_paths

            prompt = "Analyze the following video content. Provide a detailed description of both visual and audio elements."
            contents = [{"role": "user", "parts": [{"text": prompt}, {"inline_data": {"mime_type": "audio/mp3", "data": audio_data}}]}]

            for frame in frame_paths[:10]:
                with open(frame, "rb") as img_file:
                    img_data = img_file.read()
                contents.append({"role": "user", "parts": [{"inline_data": {"mime_type": "image/jpeg", "data": img_data}}]})
            response = self.model.generate_content(contents=contents)
            return response.text if response and hasattr(response, "text") else "Failed to generate video description."
        except Exception as e:
            return f"Error: {str(e)}"

    def transcribe_audio(self, audio_path):
        with open(audio_path, "rb") as audio_file:
            audio_data = audio_file.read()
        prompt = "Please listen carefully to the attached audio file and provide an accurate transcription of the speech."
        response = self.model.generate_content(
            contents=[{
                "role": "user",
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": "audio/mpeg", "data": audio_data}}
                ]
            }]
        )
        return response.text if response and hasattr(response, "text") else "Transcription failed."

    def describe_image(self, image_path):
        try:
            mime_type, _ = mimetypes.guess_type(image_path)
            if not mime_type or not mime_type.startswith("image/"):
                raise ValueError("Unsupported file type. Please provide a valid image format.")
            with open(image_path, "rb") as img_file:
                img_data = img_file.read()
            prompt = "Analyze the attached image and provide a detailed description of its contents."
            response = self.model.generate_content(
                contents=[{
                    "role": "user",
                    "parts": [
                        {"text": prompt},
                        {"inline_data": {"mime_type": mime_type, "data": img_data}}
                    ]
                }]
            )
            return response.text if response and hasattr(response, "text") else "Description generation failed."
        except Exception as e:
            return f"Error: {str(e)}"

    def extract_submission_text(self, submission_path, submission_type):
        """Convert any submission type into plain text format."""
        try:
            if submission_type == 'text':
                if submission_path.lower().endswith('.pdf'):
                    with fitz.open(submission_path) as pdf_document:
                        extracted_text = ""
                        for page in pdf_document:
                            extracted_text += page.get_text("text")
                    return extracted_text if extracted_text.strip() else "No readable text found in PDF."
                else:
                    with open(submission_path, 'r', encoding='utf-8') as file:
                        return file.read()
            elif submission_type == 'image':
                return self.describe_image(submission_path)
            elif submission_type == 'video':
                return self.describe_video(submission_path)
            elif submission_type == 'audio':
                return self.transcribe_audio(submission_path)
            else:
                raise ValueError(f"Unsupported submission type: {submission_type}")
        except Exception as e:
            print(f"Error extracting submission text: {str(e)}")
            return "Error processing submission."
        
    def process_submission(self, submission_path, submission_type, rubric_data, problem_statement):
        try:
            extracted_text = self.extract_submission_text(submission_path, submission_type)
            if not extracted_text or "Error" in extracted_text or extracted_text.strip() == "":
                raise ValueError("Failed to extract meaningful text from the submission.")
            response = self.evaluate_submission(extracted_text, rubric_data, problem_statement)
            return self.extract_json_from_response(response)
        except Exception as e:
            print(f"Error processing submission: {str(e)}")
            return None
        
    def parse_rubric(self, rubric_data):
        parameters = []
        scoring_levels = {}
        
        for param in rubric_data['assessmentRows']:
            param_name = param['parameter']
            if param_name:
                parameters.append(param_name)
                scoring_levels[param_name] = {
                    'low': {'points': 0.5, 'description': param['low']},
                    'mid': {'points': 1, 'description': param['mid']},
                    'high': {'points': 2, 'description': param['high']}
                }
        
        weightage = {"Priority 1": [], "Priority 2": [], "Priority 3": []}
        for weight in rubric_data['weightageRows']:
            param_name = weight['parameter']
            weight_value = weight['weightage']
            
            if param_name and weight_value:
                try:
                    weight_num = float(weight_value)
                    if weight_num >= 0.8:
                        priority = "Priority 1"
                    elif weight_num >= 0.6:
                        priority = "Priority 2"
                    else:
                        priority = "Priority 3"
                    weightage[priority].append(param_name)
                except ValueError:
                    print(f"Invalid weightage value: {weight_value}")
        
        return {
            'parameters': parameters,
            'scoring_levels': scoring_levels,
            'weightage': weightage
        }

    def create_evaluation_prompt(self, problem_statement, rubric):
        prompt = f"""
You are an evaluator assessing a textual submission based on the given problem statement and rubric. 
Carefully analyze the content and assign appropriate scores according to the rubric.

PROBLEM STATEMENT:
{problem_statement}

Evaluation Rubric:
Each parameter is graded as follows:
    - Low (0.5 pt): Does not meet expectations or lacks key aspects.
    - Mid (1 pt): Partially meets expectations with some missing details.
    - High (2 pt): Fully meets expectations with clear and detailed information.

Scoring Parameters:
"""
        for param_name in rubric['parameters']:
            if param_name in rubric['scoring_levels']:
                param_levels = rubric['scoring_levels'][param_name]
                prompt += f"""
{param_name}:
- Low (0.5pt): {param_levels['low']['description']}
- Mid (1pt): {param_levels['mid']['description']}
- High (2pt): {param_levels['high']['description']}
"""
        
        prompt += "\nParameter Weightage (Higher priority parameters carry more weight):"
        for priority, params in rubric['weightage'].items():
            if params:
                prompt += f"\n{priority}: {', '.join(params)}"
        
        prompt += """
Please provide your evaluation in the following json format:
{
    "summary": "A concise 2-3 sentence summary of the submission, capturing key points.",
    "parameters": {
        "param1": {
            "explanation": "Explain why the assigned score was given.",
            "annotation": "low | mid | high"
        },
        "param2": {
            "explanation": "Explain why the assigned score was given.",
            "annotation": "low | mid | high"
        }
    },
    "key_highlights": ["Highlight 1", "Highlight 2"],
    "areas_of_improvement": ["Suggestion 1", "Suggestion 2"],
    "overall_score": "Calculated weighted score out of 10"
}
"""
        return prompt

    def evaluate_submission(self, extracted_text, rubric_data, problem_statement):
        try:
            rubric = self.parse_rubric(rubric_data)
            prompt = self.create_evaluation_prompt(problem_statement, rubric)
            response = self.model.generate_content(
                contents=[
                    {"role": "user", "parts": [{"text": prompt}]},
                    {"role": "user", "parts": [{"text": extracted_text}]}
                ]
            )
            return response
        except Exception as e:
            print(f"Error in evaluation: {str(e)}")
            return None
        
    def extract_json_from_response(self, response):
        if not response or not hasattr(response, "text"):
            print("\n❌ No valid response received.")
            return None
        try:
            response_text = response.text.strip() if hasattr(response, "text") else str(response)
            json_match = re.search(r'```json\n(.*?)\n```', response_text, re.DOTALL)
            if json_match:
                json_data = json_match.group(1)
                return json.loads(json_data)
            else:
                return json.loads(response_text)
        except json.JSONDecodeError as e:
            print("\n❌ JSON Parsing Error:", e)
            return None
        
    def compute_weighted_score(self, evaluation_data, rubric_data):
        if not evaluation_data or 'parameters' not in evaluation_data:
            return 0
        
        rubric = self.parse_rubric(rubric_data)
        score_mapping = {'low': 0.5, 'mid': 1.0, 'high': 2.0}
        parameter_scores = evaluation_data.get("parameters", {})
        weightage = rubric.get("weightage", {})
        
        param_weights = {}
        for priority, params in weightage.items():
            weight_value = {"Priority 1": 1.0, "Priority 2": 0.8, "Priority 3": 0.6}.get(priority, 0.5)
            for param in params:
                param_weights[param] = weight_value
        
        total_weighted_score = 0
        total_weight = 0
        
        for param, details in parameter_scores.items():
            annotation = details.get("annotation", "").strip().lower()
            score = score_mapping.get(annotation, 0)
            weight = param_weights.get(param, 0.5)
            total_weighted_score += score * weight
            total_weight += weight
        
        final_score = (total_weighted_score / total_weight) * 5 if total_weight > 0 else 0
        return round(final_score, 2)
    
    def evaluate(self, file_path, problem_statement, rubric_data):
        file_ext = os.path.splitext(file_path)[1].lower()
        if file_ext in ['.jpg', '.jpeg', '.png', '.gif']:
            submission_type = 'image'
        elif file_ext in ['.mp4', '.mov', '.avi']:
            submission_type = 'video'
        elif file_ext in ['.mp3', '.wav']:
            submission_type = 'audio'
        else:
            submission_type = 'text'
        
        evaluation_data = self.process_submission(file_path, submission_type, rubric_data, problem_statement)
        
        if evaluation_data:
            overall_score = self.compute_weighted_score(evaluation_data, rubric_data)
            evaluation_data['overall_score'] = overall_score
            evaluation_data['file_name'] = os.path.basename(file_path)
        
        return evaluation_data or {"error": "Failed to evaluate submission"}

def process_queue():
    while True:
        task = evaluation_queue.get()
        if task is None:
            break
        
        task_id, file_path, problem_statement, rubric_data = task
        try:
            model = GeminiService()
            result = model.evaluate(file_path, problem_statement, rubric_data)
            with results_lock:
                results_store[task_id] = result
            
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            with results_lock:
                results_store[task_id] = {"error": str(e)}
        finally:
            evaluation_queue.task_done()

# Start queue processor thread
Thread(target=process_queue, daemon=True).start()

@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    if 'files[]' not in request.files:
        return jsonify({"error": "No files provided"}), 400
    
    files = request.files.getlist('files[]')
    if len(files) > app.config['MAX_FILES']:
        return jsonify({"error": f"Maximum {app.config['MAX_FILES']} files allowed"}), 400
    
    try:
        problem_statement = request.form.get('problem_statement', '')
        rubric_json = request.form.get('rubric', '{}')
        rubric_data = json.loads(rubric_json)
        
        if not rubric_data or 'assessmentRows' not in rubric_data or 'weightageRows' not in rubric_data:
            return jsonify({"error": "Invalid rubric format"}), 400
        
        task_ids = []
        results = []
        model = GeminiService()  # Create one instance for all files
        
        for file in files:
            if file.filename == '':
                continue
            
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            task_id = str(uuid.uuid4())
            task_ids.append(task_id)
            
            # Process immediately instead of using queue
            try:
                result = model.evaluate(file_path, problem_statement, rubric_data)
                with results_lock:
                    results_store[task_id] = result
                    results.append(result)
                
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                error_result = {"error": str(e), "file_name": filename}
                with results_lock:
                    results_store[task_id] = error_result
                    results.append(error_result)
        
        # Sort results by score for leaderboard
        valid_results = [r for r in results if isinstance(r, dict) and 'overall_score' in r]
        sorted_results = sorted(valid_results, key=lambda x: x['overall_score'], reverse=True)
        
        # Add ranks
        for i, entry in enumerate(sorted_results):
            entry['rank'] = i + 1
        
        return jsonify({
            "task_ids": task_ids,
            "results": results,
            "leaderboard": sorted_results,
            "message": f"Evaluation completed for {len(files)} files",
            "total_files": len(files)
        })
    
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON data"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/results/<task_id>', methods=['GET'])
def get_result(task_id):
    with results_lock:
        result = results_store.get(task_id)
    if not result:
        return jsonify({"status": "processing"}), 202
    return jsonify(result)

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    with results_lock:
        valid_results = [
            {**result, "task_id": task_id}
            for task_id, result in results_store.items()
            if isinstance(result, dict) and 'overall_score' in result
        ]
    
    leaderboard = sorted(
        valid_results,
        key=lambda x: x['overall_score'],
        reverse=True
    )
    
    for i, entry in enumerate(leaderboard):
        entry['rank'] = i + 1
    
    return jsonify(leaderboard)

@app.route('/api/status', methods=['GET'])
def get_status():
    with results_lock:
        total = len(results_store)
        completed = sum(1 for r in results_store.values() if isinstance(r, dict) and 'overall_score' in r)
    
    return jsonify({
        "total_files": total,
        "completed": completed,
        "pending": evaluation_queue.qsize()
    })

if __name__ == '__main__':
    app.run(debug=True)