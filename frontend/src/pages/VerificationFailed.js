import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const VerificationFailed = () => {
  return (
    <Container className="mt-5">
      <Alert variant="danger">
        <Alert.Heading>Email Verification Failed</Alert.Heading>
        <p>
          The verification link is invalid or has expired. Please try registering again.
        </p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button as={Link} to="/register" variant="outline-danger">
            Go to Registration
          </Button>
        </div>
      </Alert>
    </Container>
  );
};

export default VerificationFailed;