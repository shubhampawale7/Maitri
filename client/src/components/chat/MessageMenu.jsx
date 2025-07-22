import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import {
  FiMoreHorizontal, // Changed for a more standard menu icon
  FiTrash2,
  FiArrowUp,
  FiArrowRight,
  FiCheckSquare,
} from "react-icons/fi";

// --- Configuration for Menu Items ---
// This approach keeps the component clean and easy to update.
const menuItems = [
  { name: "Reply", icon: FiArrowUp, action: "reply" },
  { name: "Forward", icon: FiArrowRight, action: "forward" },
  { name: "Select", icon: FiCheckSquare, action: "select" },
  {
    name: "Delete",
    icon: FiTrash2,
    action: "delete",
    isDestructive: true,
    ownerOnly: true, // Custom flag to control visibility for the owner
  },
];

/**
 * A redesigned, modern, and responsive menu for chat messages.
 * Uses Headless UI for accessibility and Framer Motion for delightful animations.
 *
 * @param {object} props - The component props.
 * @param {function} props.onAction - Callback function when a menu item is clicked.
 * @param {boolean} props.fromMe - Determines the menu alignment.
 *
 * @note For the menu button to be permanently visible, ensure the parent container
 * does not have `opacity-0` or `group-hover:opacity-100` classes.
 * The button should be visible by default.
 */
const MessageMenu = ({ onAction, fromMe }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {/* --- Menu Trigger Button --- */}
      <Menu.Button
        as={motion.button}
        // The animation is preserved as requested.
        whileHover={{ scale: 1.2, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        // --- VISIBILITY & COLOR UPDATE ---
        // The button is now always visible with a consistent dark color.
        // The ternary logic for `fromMe` was removed to make the icon dark on all message types.
        className="flex items-center justify-center p-1.5 rounded-full text-gray-600 hover:text-black hover:bg-gray-500/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-pink"
        aria-label="Message options"
      >
        <FiMoreHorizontal size={20} />
      </Menu.Button>

      {/* --- Animated Menu Panel --- */}
      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-100"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        {/* The menu still opens downwards for a better user experience. */}
        <Menu.Items
          className={`absolute ${
            fromMe ? "right-0" : "left-0"
          } top-full mt-2 w-52 origin-top rounded-xl bg-background/80 p-1.5 shadow-xl backdrop-blur-sm ring-1 ring-border/50 focus:outline-none z-20`}
        >
          {menuItems.map((item) => {
            // Conditionally render the item based on ownership
            if (item.ownerOnly && !fromMe) {
              return null;
            }

            // Generates dynamic classes for idle and active states
            const itemClasses = ({ active }) =>
              `flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                active
                  ? item.isDestructive
                    ? "bg-rose-500 text-white" // Destructive action active state
                    : "bg-primary/10 text-primary" // Normal action active state
                  : item.isDestructive
                  ? "text-rose-500" // Destructive action idle state
                  : "text-foreground/80" // Normal action idle state
              }`;

            return (
              <Menu.Item key={item.name}>
                {({ active }) => (
                  <button
                    onClick={() => onAction(item.action)}
                    className={itemClasses({ active })}
                  >
                    <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                    <span>{item.name}</span>
                  </button>
                )}
              </Menu.Item>
            );
          })}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default MessageMenu;
