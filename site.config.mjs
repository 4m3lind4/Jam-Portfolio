// Edit this file to change the words around your projects.
// Project content itself comes from the Notion "Projects" database.

export default {
  name: "Jam",
  title: "Jam Portfolio",
  intro:
    "I design and build apps, from the first Figma frame to the SwiftUI that ships.",
  // Shown in the footer and the contact section. Leave a value empty to hide it.
  links: {
    email: "",
    github: "https://github.com/4m3lind4",
    linkedin: "",
  },
  // Colour and label for each Category option in Notion.
  // Add a row here if you add a new Category option.
  categories: {
    Work: { label: "Work", color: "#2F5BEA", ink: "#FFFFFF" },
    University: { label: "University", color: "#C2306B", ink: "#FFFFFF" },
    Competition: { label: "Competition", color: "#F2A900", ink: "#1A1D24" },
  },
  defaultCategory: { label: "Project", color: "#5B6170", ink: "#FFFFFF" },

  // The scroll-driven project menu on the home page.
  // Projects come from Notion; each Category becomes a menu section.
  menu: {
    // Section order and the banner printed at the top of each menu page.
    sections: [
      { category: "Work", banner: "Main" },
      { category: "University", banner: "Chef's Special" },
      { category: "Competition", banner: "Dessert" },
    ],
    // Banner for any Category not listed above.
    otherBanner: "Specials",
    // Optional "Critic Reviews" block printed under one project's dish.
    // Set to null to remove it.
    reviews: {
      slug: "periodt",
      title: "Critic Reviews",
      text: "PeriodT has been highly praised by Tech judges. Let's see what was said…",
      image: "menu/testimonial.jpg",
    },
    backCover: [
      "If you wish to",
      "Leave a review in the inboxes.",
    ],
    contact: ["ph: 0451 156 160", "Email: amelinda.mang2@gmail", "Esta . 2025"],
    bill: {
      brand: "jam",
      place: "Sydney",
      contact: ["ph: 0451 156 160", "Email: amelinda.mang2@gmail"],
      card: "VISA .....1267 APPROVED",
    },
  },
};
