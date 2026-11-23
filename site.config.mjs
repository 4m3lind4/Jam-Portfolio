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
  // What the waiter says at the door on the home page, one sentence per line.
  welcome: [
    "Welcome to Jam!",
    "I'm Jam, and I'll be looking after you tonight.",
    "Everything on our menu is designed and built in house.",
    "Right this way, your table's ready.",
  ],
  welcomeCta: "Follow me to your table",
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
    University: { label: "Education", color: "#C2306B", ink: "#FFFFFF" },
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
    // The ride at the end of the page: the chef pulls up, honks, and offers a
    // lift to the restaurant (the home page). "No" gets a cheeky answer.
    ride: {
      car: "about/car.webp",
      invite: "Get in the car, we're going to the restaurant!",
      yes: "Okay, coming!",
      no: "No",
      // Each "no" gets a cheekier answer and a new way to say no, until the
      // only reply left is yes. honk: how many times the horn goes.
      refusals: [
        { answer: "Aren't you supposed to recruit??", next: "Still no" },
        { answer: "The chef's cooking tonight. Seven-course tasting menu, every course a project.", next: "Not hungry" },
        { answer: "*Honk honk!* That's the car agreeing with me.", honk: 1, next: "I'm busy" },
        { answer: "Busy hiring a designer? What a coincidence, I am one!", next: "Hmm…" },
        { answer: "I'll just keep honking until you say yes. *Honk! Honk! Honk!*", honk: 3, next: null },
      ],
      giveIn: "Fine, I'm coming!",
    },
  },

  // Shown in a phone frame on a project's page, by project Slug: either an
  // interactive web version of the app (path, from static/demos/) or a
  // screen recording of it (video and poster, from static/videos/).
  demos: {
    periodt: {
      path: "demos/periodt/",
      title: "Try the app",
      intro: "A web version of PeriodT, rebuilt from the app's SwiftUI code. Tap through the tabs, log how you're feeling, and open an exercise.",
    },
    "periodt-coach": {
      video: "videos/periodt-coach-walkthrough.mp4",
      poster: "videos/periodt-coach-walkthrough.jpg",
      title: "See it in action",
      intro: "A full walkthrough of PeriodT Coach on iPhone: the team overview, each athlete's page, and how coaches see who's ready to train.",
    },
  },

  // A gallery at the end of a project's page, by project Slug. Each piece is
  // shown in a 3D frame and opens in a close-up with its description:
  //   stand: a monitor on a stand (landscape kiosks)
  //   totem: a freestanding portrait kiosk
  //   wall:  a screen set into a slatted wall
  //   photo: the image as it is (renders, design sheets)
  galleries: {
    envent: {
      title: "Gallery",
      intro: "The kiosks and screens I designed across Envent's hospital sites. Click one for a closer look.",
      items: [
        {
          frame: "photo",
          src: "gallery/envent/st-george-kiosk-3d.webp",
          title: "St George Hospital",
          text: "The level 1 kiosk, mid-route to DOSA. The map marks the way with a one-minute, 100 m guide, while categories, search and quick links stay within easy reach.",
        },
        {
          frame: "stand",
          src: "gallery/envent/peninsula-kiosk.gif",
          title: "Peninsula University Hospital",
          text: "Searching Food & Retail on the level 1 kiosk. Every destination is a tap or two away: choose a category, pick a place, then follow the route on the map.",
          link: "https://envent.com.au/project/peninsula-university-hospital-public-transport",
          linkText: "Read about this project on Envent's site",
        },
        {
          frame: "totem",
          src: "gallery/envent/sch-kiosk.gif",
          title: "Sydney Children's Hospital, Randwick",
          text: "A portrait kiosk for browsing every destination by category, with the building and level shown before you set off.",
        },
        {
          frame: "wall",
          src: "gallery/envent/peninsula-transport.png",
          title: "Peninsula University Hospital: getting home",
          text: "Built into the wall by the exit: live bus and train departures beside a walking map to each stop. Shown here with example data.",
          link: "https://envent.com.au/project/peninsula-university-hospital-public-transport",
          linkText: "Read about this project on Envent's site",
        },
      ],
    },
  },

  // The scroll-driven project menu on the home page.
  // Projects come from Notion; each Category becomes a menu section.
  menu: {
    // Projects whose cover is a cut-out (transparent background), by Slug:
    // shown whole on the plate with a shadow that follows its shape.
    cutouts: ["envent"],
    // Stickers on a dish's plate, by project Slug.
    stickers: { periodt: "Winner Dish for TechFest" },
    // The banner printed at the top of each menu page, by Category. Dishes
    // are served in the projects' Order from Notion.
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
