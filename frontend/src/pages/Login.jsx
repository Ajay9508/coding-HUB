import {
  useState
} from "react";

import {
  useNavigate,
  Link
} from "react-router-dom";

import Button from
  "../components/atoms/Button";

import { useAuth } from
  "../context/useAuth";

const Login = () => {
  const navigate =
    useNavigate();

  const {
    login
  } = useAuth();

  const [
    email,
    setEmail
  ] = useState("");

  const [
    password,
    setPassword
  ] = useState("");

  const [
    error,
    setError
  ] = useState("");

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      try {
        setError("");

        await login(
          email,
          password
        );

        navigate(
          "/dashboard"
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
          error.message ||
          "Login failed"
        );
      }
    };

  return (
    <div className="
      flex min-h-screen
      items-center
      justify-center
      auth-shell
      bg-[#FFFBF5]
      px-6
    ">
      <form
        onSubmit={handleSubmit}
        className="
          auth-card w-full max-w-md
          rounded-3xl
          border border-[#E9E2D8]
          bg-white
          p-8
          shadow-sm
        "
      >

        <h1 className="
          text-3xl
          font-black
        ">
          Welcome back
        </h1>

        <p className="
          mt-2
          text-[#5F5F5F]
        ">
          Login to Coding Hub
        </p>

        {error && (
          <div className="
            mt-5 rounded-xl
            bg-[#FFE2DE]
            p-3
            text-sm
            text-[#F35F67]
          ">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="
            mt-6 w-full
            rounded-xl
            border border-[#E9E2D8]
            p-4
            outline-none
            focus:border-[#FF7378]
          "
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="
            mt-4 w-full
            rounded-xl
            border border-[#E9E2D8]
            p-4
            outline-none
            focus:border-[#FF7378]
          "
        />

        <div className="mt-6">
          <Button type="submit">
            Login
          </Button>
        </div>

        <p className="
          mt-6 text-sm
          text-[#5F5F5F]
        ">
          Don't have an account?

          <Link to="/register" className="ml-2 font-semibold text-[#F35F67]">
            Register
          </Link>
        </p>

      </form>
    </div>
  );
};

export default Login;
