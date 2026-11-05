// Edit this file to change the words around your projects.
// Project content itself comes from the Notion "Projects" database.

const EMAIL = "amelinda.mang2@gmail.com";
const LINKEDIN = "https://www.linkedin.com/in/jessica-amelinda-mang/";
const GITHUB = "https://github.com/4m3lind4";

const CONTACT = [
  { text: "ph: 0451 156 160", href: "tel:+61451156160" },
  { text: `Email: ${EMAIL}`, href: `mailto:${EMAIL}` },
  { text: "LinkedIn", href: LINKEDIN },
  { text: "GitHub", href: GITHUB },
];

export default {
  name: "Jam",
  title: "Jam Portfolio",
  intro:
    "I design and build apps, from the first Figma frame to the SwiftUI that ships.",
  // Shown in the footer and the contact section. Leave a value empty to hide it.
  links: {
    email: EMAIL,
    github: GITHUB,
    linkedin: LINKEDIN,
  },
  // Colour and label for each Category option in Notion.
  // Add a row here if you add a new Category option.
  categories: {
    Work: { label: "Work", color: "#2F5BEA", ink: "#FFFFFF" },
    University: { label: "University", color: "#C2306B", ink: "#FFFFFF" },
    Competition: { label: "Competition", color: "#F2A900", ink: "#1A1D24" },
  },
  defaultCategory: { label: "Project", color: "#5B6170", ink: "#FFFFFF" },

  // "About the Chef" on the home page. Text comes from the About the Chef
  // page in Notion; Experience, Education, Skills and Awards come from the
  // Résumé table inside it. These IDs are not secret.
  about: {
    heading: "About the Chef",
    pageId: "40f42916-eb9d-8144-b9d9-cd2760fb19f3",
    resumeDataSourceId: "3144e98d-9622-43a4-bc9f-df4be63ec095",
    // Order of the résumé sections; rows with any other Section go last.
    sections: ["Experience", "Education", "Skills", "Awards"],
    // Used when the About page in Notion has no image block.
    photo: "about/chef-photo.webp",
    // Link for the "Download PDF Resume" button. Leave empty to hide it.
    resumePdf: "",
  },

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
    contact: CONTACT,
    established: "Esta . 2025",
    bill: {
      brand: "jam",
      place: "Sydney",
      contact: CONTACT,
      card: "VISA .....1267 APPROVED",
    },
  },
};
