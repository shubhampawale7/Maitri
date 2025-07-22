import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { loginUserApi } from "../api/auth";
import { setCredentials } from "../features/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import { CgSpinner } from "react-icons/cg";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) navigate("/chat");
  }, [navigate, userInfo]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: loginUserApi,
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      toast.success("Logged in successfully!");
      navigate("/chat");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Something went wrong";
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data) => mutate(data);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-screen overflow-hidden p-4">
      {/* Animated Gradient Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 animate-gradient"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #fecdd3, #fde68a, #bfdbfe, #fbcfe8)",
          backgroundSize: "400% 400%",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-2xl p-8">
          <div className="text-center mb-8">
            <img
              src="/file.svg"
              alt="Maitri Logo"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h1 className="text-4xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 mt-2">Login to your Maitri account.</p>
          </div>

          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Email Input */}
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                id="email"
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-pink transition-all duration-300"
                {...register("email")}
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-xs mt-1 ml-2"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password Input */}
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                id="password"
                placeholder="Password"
                className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-pink transition-all duration-300"
                {...register("password")}
              />
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-xs mt-1 ml-2"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <div>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center bg-gradient-to-br from-brand-pink to-brand-orange text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isPending ? (
                  <CgSpinner className="animate-spin text-2xl" />
                ) : (
                  <>
                    <FiLogIn className="mr-2" />
                    Login
                  </>
                )}
              </motion.button>
            </div>

            <div className="text-center">
              <p className="text-slate-500 text-sm">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-brand-pink hover:text-brand-pink/80 font-bold transition-colors duration-300"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
