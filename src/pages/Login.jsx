// https://gigaland.io/login-2.html

import React, { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLinkClickHandler, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import usePost from "../api/usePost";
import AuthContext from "../auth/WalletContext";
import GlowButton from "../components/buttons/GlowButton";
import TextInput from "../components/inputs/TextInput";
import { validateEmail, validatePassword } from "../helpers/form-validators";

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { signin } = useContext(AuthContext);
  const state = useLocation().state;
  const navigate = useNavigate();
  const [postLogin, requestState] = usePost("/auth/login");

  useEffect(() => {
    if (requestState.loading) return;

    if (requestState.data?.success) {
      delete requestState.data.success;
      signin(requestState.data);
      navigate(state?.claim ? "/?claim=" + state.claim : "/");
      return;
    }
    if (requestState.error) {
      console.log(requestState.error);
      toast.error(requestState.error?.message);
    }
  }, [requestState]);

  const onSubmit = (data) => {
    postLogin(data);
  };

  return (
    <section aria-label="section">
      <div className="px-5 pb-10 lg:pb-20 max-w-md lg:max-w-2xl  mx-auto">
        <div className="">
          <h3 className="font-bold text-2xl md:text-3xl mt-12 mb-9">
            Login to your account
          </h3>
          <form
            name="contactForm"
            id="contact_form"
            className="grid grid-cols-1 gap-7"
            onSubmit={handleSubmit(onSubmit)}>
            <TextInput
              label="Email"
              name="email"
              id="login-email"
              {...register("email", { validate: validateEmail })}
              error={errors.email}
            />

            <TextInput
              label="Password"
              name="password"
              isPassword
              id="login-password"
              {...register("password", { validate: validatePassword })}
              error={errors.password}
            />

            <div className="w-fit text-sm xl:text-base">
              <GlowButton
                disabled={requestState.loading}
                type="submit"
                padding="py-1 px-10">
                {requestState.loading ? "..." : "Login"}
              </GlowButton>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Login;
