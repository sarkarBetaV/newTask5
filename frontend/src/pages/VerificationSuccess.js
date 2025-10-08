import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const VerificationSuccess = () => {
  return (
    <Container className="mt-5">
      <Alert variant="success">
        <Alert.Heading>Email Verified Successfully!</Alert.Heading>
        <p>
          Your email address has been verified. You can now log in to your account.
        </p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button as={Link} to="/login" variant="outline-success">
            Go to Login
          </Button>
        </div>
      </Alert>
    </Container>
  );
};

export default VerificationSuccess;