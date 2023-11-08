import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';


const NotFound = () => {
  return (
    <>

      <div className="notfound">
      <h1>Page Not Found</h1>
      <p>Oops! return to Home page to proceed.</p>
      <Link to="/"><div><Button color="primary" >Home </Button></div></Link>
    </div>
    
    </>
    
  );
};

export default NotFound;