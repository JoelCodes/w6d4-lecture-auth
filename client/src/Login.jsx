import React from 'react';

function Login(props) {
  const onSubmit = (e) => {
    e.preventDefault();
    const { email: { value: email }, password: { value: password } } = e.target.elements;
    props.tryLogin(email, password);
  };
  return (<div className="modal-bg">
    <div className="modal-box">
      <h2>Log In</h2>
      <form onSubmit={onSubmit}>
        <p>
          <input type="email" placeholder="Email" name="email" />
        </p>
        <p>
          <input type="password" placeholder="Password" name="password" />
        </p>
        <p>
          <button type="submit">Submit</button>
        </p>
      </form>
    </div>
  </div>);
}

export default Login;
