import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import usePost from "../api/usePost";
import GlowButton from "../components/buttons/GlowButton";
import TextInput from "../components/inputs/TextInput";
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
  validateUsername,
} from "../helpers/form-validators";

// https://gigaland.io/register.html

function Register() {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setError,
    formState: { errors, isValidating },
  } = useForm();

  console.log("Rednering");

  const [postRegister, requestState] = usePost("/auth/registerbody");

  useEffect(() => {
    if (requestState.loading) return;

    if (requestState.data?.success) {
      toast.success("You have been registered successfully!");
      reset();
      return;
    }
    if (requestState.error) {
      toast.error(requestState.error.message);
    }
  }, [requestState]);

  useEffect(() => {
    const { confirmPass, password } = getValues();
    if (password !== confirmPass) {
      setError("confirmPass", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }
  }, [isValidating]);

  const onSubmit = (data) => {
    delete data.confirmPass;

    postRegister(data);
  };

  return (
    <section aria-label="section">
      <div className="px-5 pb-10 lg:pb-20 max-w-lg md:max-w-xl xl:max-w-4xl  mx-auto">
        <div className="mt-10 sm:mt-12 md:mt-16">
          <h3 className="text-2xl md:text-3xl font-bold">
            Don't have an account? Register now.
          </h3>
          <p className="text-gray-500 mt-6 sm:mt-8">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo.
          </p>
        </div>

        <form
          name="contactForm"
          id="contact_form"
          className="form-border"
          onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 mt-8 gap-7">
            <TextInput
              label="Name"
              name="name"
              id="reg-name"
              {...register("name", { validate: validateName })}
              error={errors.name}
            />
            <TextInput
              label="Email"
              name="email"
              id="reg-email"
              {...register("email", { validate: validateEmail })}
              error={errors.email}
            />
            <TextInput
              label="Choose a username"
              name="username"
              id="reg-username"
              {...register("username", { validate: validateUsername })}
              error={errors.username}
            />
            <TextInput
              label="Phone Number"
              name="phone"
              id="reg-phone"
              {...register("phone", { validate: validatePhone })}
              error={errors.phone}
            />
            <TextInput
              label="Password"
              name="password"
              id="reg-password"
              isPassword
              {...register("password", { validate: validatePassword })}
              error={errors.password}
            />
            <TextInput
              label="Confirm Password"
              name="confirmPass"
              isPassword
              id="reg-confirmpass"
              {...register("confirmPass")}
              error={errors.confirmPass}
            />

            <div className="w-fit text-sm xl:text-base">
              <GlowButton
                disabled={requestState.loading}
                type="submit"
                padding="py-1 px-10">
                {requestState.loading ? "..." : "Register"}
              </GlowButton>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Register;
