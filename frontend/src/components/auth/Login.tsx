import { useState, type FormEvent, type ChangeEvent, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { LoginFormData } from "../../types";

const Login = () => {
  const { state, login, clearErrors } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate("/profile");
    }

    return () => {
      clearErrors();
    };
  }, [state.isAuthenticated, navigate, clearErrors]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field-specific error when user types
    setFormErrors({ ...formErrors, [e.target.name]: "" });
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const errors = { email: "", password: "" };

    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear any previous errors
    clearErrors();
    
    if (validateForm()) {
      try {
        // Disable form during submission
        const form = e.currentTarget;
        const inputs = Array.from(form.elements) as HTMLInputElement[];
        inputs.forEach(input => {
          if (input.type !== 'submit') {
            input.disabled = true;
          }
        });
        
        await login(email, password);
        // If successful, the AuthProvider will update the state and redirect
        
        // Re-enable form if not redirected
        if (!state.isAuthenticated) {
          inputs.forEach(input => {
            if (input.type !== 'submit') {
              input.disabled = false;
            }
          });
        }
      } catch (error) {
        console.error('Login error:', error);
        // Error handling is done in the AuthProvider
        
        // Re-enable form inputs on error
        const form = e.currentTarget;
        const inputs = Array.from(form.elements) as HTMLInputElement[];
        inputs.forEach(input => {
          if (input.type !== 'submit') {
            input.disabled = false;
          }
        });
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Login</h1>
        <Link to="/" className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded">
          Home
        </Link>
      </div>

      {state.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {state.error}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your email"
          />
          {formErrors.email && (
            <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
          )}
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your password"
          />
          {formErrors.password && (
            <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${state.loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'}`}
            disabled={state.loading}
          >
            {state.loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : "Login"}
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:text-blue-700">
              Register here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
