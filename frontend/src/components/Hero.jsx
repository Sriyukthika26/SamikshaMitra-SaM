import { useNavigate } from "react-router-dom";
import './Hero.css';

function Hero() {
  const navigate = useNavigate();

  const hackathons = [
    {
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTaitTQtn73TQryK6kvA3p8ZQSkmnnIHGJB5jZp8ZN7bqdLaDPSnMA80CzcQK-e9J8GPI&usqp=CAU",
      name: "InnovateX 2025",
      description: "A global innovation challenge where developers, designers, and entrepreneurs collaborate to solve real-world problems using cutting-edge technology."
    },
    {
      image: "https://uploads.turbologo.com/uploads/design/preview_image/1266717/preview_image20201013-13757-6z6ow3.png",
      name: "CodeSprint",
      description: "A 48-hour coding marathon that tests participants' problem-solving skills in AI, blockchain, and full-stack development."
    },
    {
      image: "https://media.istockphoto.com/id/1216719216/vector/hackathon-logo.jpg?s=612x612&w=0&k=20&c=OS5iPVyAiXQiihTaH3ubHzPtsMHOEuTHb74-ZTKiYjY=",
      name: "Hack the Future",
      description: "A student-focused hackathon that encourages participants to develop solutions for sustainability, healthcare, and smart cities."
    },
    {
      image: "https://media.istockphoto.com/id/1216719216/vector/hackathon-logo.jpg?s=612x612&w=0&k=20&c=OS5iPVyAiXQiihTaH3ubHzPtsMHOEuTHb74-ZTKiYjY=",
      name: "Byte Brawl",
      description: "A competitive coding and hacking event where teams build software products in fintech, gaming, and cybersecurity."
    },
    {
      image: "https://media.istockphoto.com/id/1216719216/vector/hackathon-logo.jpg?s=612x612&w=0&k=20&c=OS5iPVyAiXQiihTaH3ubHzPtsMHOEuTHb74-ZTKiYjY=",
      name: "DevGenesis",
      description: "A hybrid hackathon that merges Web3, AI, and cloud computing to push the boundaries of next-gen applications."
    },
    {
      image: "https://media.istockphoto.com/id/1216719216/vector/hackathon-logo.jpg?s=612x612&w=0&k=20&c=OS5iPVyAiXQiihTaH3ubHzPtsMHOEuTHb74-ZTKiYjY=",
      name: "BuildVerse",
      description: "A virtual hackathon that fosters innovation in metaverse, NFT marketplaces, and immersive AR/VR experiences."
    },
    {
      image: "https://media.istockphoto.com/id/1216719216/vector/hackathon-logo.jpg?s=612x612&w=0&k=20&c=OS5iPVyAiXQiihTaH3ubHzPtsMHOEuTHb74-ZTKiYjY=",
      name: "CryptoQuest",
      description: "A blockchain-focused hackathon where developers create DeFi apps, smart contracts, and cross-chain solutions."
    },
    {
      image: "https://media.istockphoto.com/id/1216719216/vector/hackathon-logo.jpg?s=612x612&w=0&k=20&c=OS5iPVyAiXQiihTaH3ubHzPtsMHOEuTHb74-ZTKiYjY=",
      name: "AI Nexus",
      description: "An AI-powered hackathon challenging participants to build machine learning models for automation, predictive analysis, and NLP."
    },
    {
      image: "https://media.istockphoto.com/id/1216719216/vector/hackathon-logo.jpg?s=612x612&w=0&k=20&c=OS5iPVyAiXQiihTaH3ubHzPtsMHOEuTHb74-ZTKiYjY=",
      name: "Open Source Odyssey",
      description: "A hackathon dedicated to contributing to open-source projects, improving existing tools, and developing new libraries."
    },
    {
      image: "https://media.istockphoto.com/id/1216719216/vector/hackathon-logo.jpg?s=612x612&w=0&k=20&c=OS5iPVyAiXQiihTaH3ubHzPtsMHOEuTHb74-ZTKiYjY=",
      name: "Hack4Good",
      description: "A social impact hackathon where participants work on projects addressing climate change, education, and accessibility."
    }
  ];

  return (
    <div className="home-container">
      {/* Top Section */}
      <header className="home-header">
        <div className="header-overlay">
          <h1>Hackathons</h1>
          <p>Discover amazing hackathons. View analytics for each event.</p>
        </div>
      </header>

      {/* Hackathon Cards Section */}
      <section className="hackathon-cards-container">
        {hackathons.map((hackathon, index) => (
          <div className="hackathon-card" key={index}>
            <img src={hackathon.image} alt={hackathon.name} className="hackathon-image" />
            <h2 className="hackathon-title">{hackathon.name}</h2>
            <p className="hackathon-description">{hackathon.description}</p>
            <button
              className="evaluation-btn"
              onClick={() => navigate('/gemini')}
            >
              Start Evaluation
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Hero;
