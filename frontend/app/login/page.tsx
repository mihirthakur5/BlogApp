"use client";

import * as Yup from "yup";
import { useLoginMutation } from "../../src/services/api";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Link from "next/link";

type loginFormData = {
  username: string;
  password: string;
};

export default function Login() {
  const [login, { isLoading }] = useLoginMutation();

  const loginValidationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const initialValues = {
    username: "",
    password: "",
  };

  const loginSubmit = async (values: loginFormData) => {
    // e.preventDefault();
    try {
      await login(values).unwrap();
      // after login, refresh the page to fetch profile
      window.location.href = "/";
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <main className="max-w-md mx-auto p-4 bg-white mt-8 flex flex-col item-center gap-2 rounded-md shadow-md">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={loginValidationSchema}
        onSubmit={loginSubmit}
      >
        {({ handleSubmit }) => (
          <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Field
                name="username"
                placeholder="Username"
                className="ring-1 ring-gray-500 rounded-sm p-2 w-full"
              />
              <ErrorMessage
                name="username"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <Field
                name="password"
                placeholder="Password"
                type="password"
                className="ring-1 ring-gray-500 rounded-sm p-2 w-full"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 font-semibold bg-blue-600 text-white px-3 py-2 rounded"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </Form>
        )}
      </Formik>

      <p className="mt-2 flex gap-1">
        Don&apos;t have an account?{" "}
        <Link className="text-blue-500" href="/register">
          Register here!
        </Link>
      </p>
    </main>
  );
}
