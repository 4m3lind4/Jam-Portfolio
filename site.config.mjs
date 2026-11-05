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
};
