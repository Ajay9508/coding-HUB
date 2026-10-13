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

const Register = () => {
  const navigate =
    useNavigate();

  const {
    register
  } = useAuth();

  const [
    name,
    setName
  ] = useState("");

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

        await register(
          name,
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
          "Registration failed"
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
        "
      >
        <h1 className="
          text-3xl font-black
        ">
          Create account
        </h1>

        <p className="
          mt-2 text-[#5F5F5F]
        ">
          Join Coding Hub
        </p>

        {error && (
          <div className="
            mt-5 rounded-xl
            bg-[#FFE2DE]
            p-3
            text-[#F35F67]
          ">
            {error}
          </div>
        )}

        <input
          placeholder="Full name"
          value={name}
          required
          onChange={(e) =>
            setName(e.target.value)
          }
          className="
            mt-6 w-full
            rounded-xl
            border border-[#E9E2D8]
            p-4
          "
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="
            mt-4 w-full
            rounded-xl
            border border-[#E9E2D8]
            p-4
          "
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          minLength={8}
          required
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="
            mt-4 w-full
            rounded-xl
            border border-[#E9E2D8]
            p-4
          "
        />

        <div className="mt-6">
          <Button type="submit">
            Create Account
          </Button>
        </div>

        <p className="
          mt-6 text-sm
          text-[#5F5F5F]
        ">
          Already registered?

          <Link
            to="/login"
            className="
              ml-2
              font-semibold
              text-[#F35F67]
            "
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
