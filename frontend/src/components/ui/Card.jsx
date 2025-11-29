import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  ...props 
}) => {
  const classes = [
    'card',
    hover ? 'transition hover:shadow-md cursor-pointer' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  const classes = ['card-header', className].filter(Boolean).join(' ');
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardBody = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  const classes = ['card-body', className].filter(Boolean).join(' ');
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  const classes = ['card-footer', className].filter(Boolean).join(' ');
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Card;