// src/config/metadata.ts

import type { Metadata } from "next";

const APP_NAME = "Dreams GYM is a premium Tailwind CSS admin dashboard template";

const DEFAULT_DESCRIPTION =
  "Dreams Gym is a premium Tailwind CSS admin dashboard template for gym and fitness management.";

export const getPageMetadata = (pageName: string): Metadata => {
  const title = `${pageName} - ${APP_NAME}`;

  const baseMetadata: Metadata = {
    title: {
      default: APP_NAME,
      template: "%s - " + APP_NAME,
    },
    description: DEFAULT_DESCRIPTION,
    keywords: [
      "Dreams Gym",
      "Gym Management Dashboard",
      "Fitness Dashboard",
      "Tailwind CSS Admin Template",
      "Gym Admin Template",
      "Fitness Management System",
      "RTL Admin Template",
    ],
    authors: [
      {
        name: "Dreams Technologies",
      },
    ],
    icons: {
      icon: "/nextjs/assets/img/favicon.png",
      apple: "/nextjs/assets/img/apple-icon.png",
    },
  };

  const pageMetadata: Record<string, Partial<Metadata>> = {
    login: {
      description:
        "Sign in to your Dreams Gym account to access the Gym Management Admin Dashboard.",
    },
    dashboard: {
      description:
        "Manage Members, Fitness, Inventory, Finance, Sales, and Facility operations from the Dreams Gym Dashboard.",
    },
    members: {
      description:
        "Manage gym members, memberships, renewals, and check-ins.",
    },
    fitness: {
      description:
        "Manage classes, trainers, workout plans, and fitness schedules.",
    },
    products: {
      description:
        "Manage products, inventory, stock levels, pricing, and categories.",
    },
    sales: {
      description:
        "Track sales orders, invoices, payments, and revenue performance.",
    },
    facility: {
      description:
        "Manage staff, equipment, branches, and facility operations.",
    },
  };

  return {
    ...baseMetadata,
    ...(pageMetadata[pageName.toLowerCase()] ?? {}),
    title: pageName ? title : APP_NAME,
  };
};