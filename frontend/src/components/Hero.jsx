import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className='py-5'>
      <Container className='d-flex justify-content-center'>
        <Card className='p-5 d-flex flex-column align-items-center hero-card bg-light w-75'>
          <h1 className='text-center mb-4'>MERN Auth & File Upload</h1>
          <p className='text-center mb-4'>
            This application demonstrates MERN authentication (with JWTs stored
            in HTTP-only cookies) plus file uploading to Cloudinary. It also
            uses Redux Toolkit and React Bootstrap.
          </p>
          <div className='d-flex gap-3'>
            <Button as={Link} to='/login' variant='primary'>
              Sign In
            </Button>
            <Button as={Link} to='/register' variant='secondary'>
              Register
            </Button>
            <Button as={Link} to='/upload' variant='success'>
              Upload File
            </Button>
            <Button as={Link} to='/gemini' variant='warning'>
              Search Gemini
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Hero;
