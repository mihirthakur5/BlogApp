"use client";

import { useRegisterMutation } from "../../src/services/api";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage as FormikError } from "formik";
import * as Yup from "yup";

export default function Register() {
  const [register, { isLoading }] = useRegisterMutation();

  const initialValues = {
    name: "",
    username: "",
    email: "",
    password: "",
    bio: "",
    avatar: null as File | null,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Full name is required"),
    username: Yup.string()
      .min(3, "Username must be at least 3 characters")
      .required("Username is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    bio: Yup.string().max(250, "Bio cannot exceed 250 characters"),
    avatar: Yup.mixed()
      .nullable()
      .notRequired()
      .test("fileSize", "File is too large", (value: unknown) => {
        if (!value) return true;
        const file = value as File;
        return !file || (file && file.size <= 5 * 1024 * 1024);
      })
      .test("fileType", "Unsupported file type", (value: unknown) => {
        if (!value) return true;
        const file = value as File;
        return (
          !file ||
          (file && ["image/jpeg", "image/png", "image/jpg"].includes(file.type))
        );
      }),
  });

  const onSubmit = async (values: typeof initialValues) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("username", values.username);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("bio", values.bio);
      if (values.avatar) formData.append("avatar", values.avatar);

      await register(formData).unwrap();
      window.location.href = "/login";
    } catch (err) {
      alert("Register failed");
    }
  };

  return (
    <main className="max-w-md mx-auto bg-white mt-8 rounded-md shadow-md flex flex-col gap-2 p-4">
      <h1 className="text-xl font-semibold mb-4">Register</h1>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ setFieldValue }) => (
          <Form className="flex flex-col gap-2">
            <Field
              name="name"
              placeholder="Full name"
              className="ring-1 ring-gray-500 rounded-sm p-2"
            />
            <FormikError
              name="name"
              component="div"
              className="text-red-500 text-sm"
            />

            <Field
              name="username"
              placeholder="Username"
              className="ring-1 ring-gray-500 rounded-sm p-2"
            />
            <FormikError
              name="username"
              component="div"
              className="text-red-500 text-sm"
            />

            <Field
              name="email"
              type="email"
              placeholder="Email"
              className="ring-1 ring-gray-500 rounded-sm p-2"
            />
            <FormikError
              name="email"
              component="div"
              className="text-red-500 text-sm"
            />

            <Field
              name="password"
              type="password"
              placeholder="Password"
              className="ring-1 ring-gray-500 rounded-sm p-2"
            />
            <FormikError
              name="password"
              component="div"
              className="text-red-500 text-sm"
            />

            <input
              type="file"
              name="avatar"
              onChange={(e) =>
                setFieldValue(
                  "avatar",
                  (e.currentTarget.files?.[0] ?? null) || null
                )
              }
              className="ring-1 ring-gray-500 rounded-sm p-2"
            />
            {/* <FormikError
              name="avatar"
              component="div"
              className="text-red-500 text-sm"
            /> */}

            <Field
              as="textarea"
              name="bio"
              placeholder="Short bio (optional)"
              className="ring-1 ring-gray-500 rounded-sm p-2 h-24"
            />
            <FormikError
              name="bio"
              component="div"
              className="text-red-500 text-sm"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 bg-blue-600 text-white px-3 py-2 rounded"
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </Form>
        )}
      </Formik>

      <p className="mt-2 flex gap-1">
        Already have an account?{" "}
        <Link className="text-blue-500" href="/login">
          Login here
        </Link>
      </p>
    </main>
  );
}
