import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  SunIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

// Animation for the container
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.5,
    },
  },
};

// Animation for each child element
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const features = [
  {
    title: "Seamless Chat",
    description:
      "Real-time messaging designed for beautiful, human conversations.",
    icon: ChatBubbleLeftRightIcon,
  },
  {
    title: "Privacy First",
    description: "End-to-end encryption with full control of your data.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Always Available",
    description: "Your conversations, always available — anytime, anywhere.",
    icon: SunIcon,
  },
];

const WelcomePage = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-slate-50 text-slate-900">
      {/* Background Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-pink-100 via-yellow-100 to-blue-100 animate-gradient-x -z-10"
        style={{ backgroundSize: "400% 400%" }}
        aria-hidden="true"
      />

      {/* Main Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-5xl w-full px-6 py-20 space-y-16 text-center"
      >
        {/* Logo + Heading */}
        <motion.div variants={fadeUp}>
          <img
            src="/file.svg"
            alt="Maitri Logo"
            className="w-20 h-20 mx-auto mb-6"
          />
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            Welcome to <span className="text-pink-600">Maitri</span>
          </h1>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
            Where privacy meets simplicity. Connect, chat, and collaborate
            across the globe — all in one secure space.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link
            to="/login"
            className="px-8 py-3 text-lg font-semibold text-white bg-pink-500 hover:bg-pink-600 rounded-lg shadow-md transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 text-lg font-semibold text-pink-600 bg-white ring-1 ring-pink-300 hover:bg-pink-50 rounded-lg transition"
          >
            Sign Up
          </Link>
        </motion.div>

        {/* Features Section */}
        <motion.div
          variants={fadeUp}
          className="grid md:grid-cols-3 gap-6 mt-10"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              whileHover={{ y: -5, scale: 1.02 }}
              className="rounded-xl bg-white ring-1 ring-slate-200 p-6 shadow hover:shadow-md transition"
            >
              <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-pink-100 text-pink-600">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
