/* ===========================================================
   Project case-study data. Edit freely — each entry powers
   project.html?slug=<slug> and the cards on the home page.
   =========================================================== */
window.MC_PROJECTS = {
  "riverside-bridge": {
    title: "The Garden House",
    tag: "Temporary Works",
    hero: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=1600&q=80",
    intro: "Temporary works to support existing structures during demolition and remodelling — propping and needling schemes detailed in Revit for safe sequencing on a constrained residential site.",
    scope: [
      "Temporary propping and needling schemes for the existing masonry",
      "Steel trimmer and support-frame details",
      "Load-transfer and back-propping coordination with the engineer",
      "Sequenced drawings for erection and strike"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1100&q=80",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1100&q=80"
    ],
    outcomes: [
      ["3D", "Temporary works fully modelled"],
      ["0", "Queries raised at erection"],
      ["Phased", "Safe demolition sequence"]
    ]
  },
  "northgate-tower": {
    title: "Brick Street",
    tag: "High-rise · Commercial",
    hero: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=80",
    intro: "A high-rise commercial project — structural drafting and BIM coordination for the frame, core and floor plates, from scheme design through to construction issue.",
    scope: [
      "General arrangement plans and sections for the frame",
      "RC core, column and slab detailing",
      "Steel-to-concrete interface details",
      "Model coordination with architecture and MEP"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1100&q=80",
      "https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?auto=format&fit=crop&w=1100&q=80"
    ],
    outcomes: [
      ["GA → detail", "Full drawing package"],
      ["Federated", "Single coordinated model"],
      ["On time", "Construction issue delivered"]
    ]
  },
  "m-corridor": {
    title: "London Metropolitan Works",
    tag: "Refurbishment",
    hero: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=80",
    intro: "Roof refurbishment and retaining structures — new dormers, purlins and secondary steelwork threaded through an existing occupied building.",
    scope: [
      "Existing, demolition and proposed dormer drawings",
      "New purlin and secondary steelwork details",
      "Roof sections through the existing structure",
      "Builder's work and interface details"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1100&q=80",
      "https://images.unsplash.com/photo-1590725140246-20acdee442be?auto=format&fit=crop&w=1100&q=80"
    ],
    outcomes: [
      ["3 stages", "Existing · demolition · proposed"],
      ["Minimal", "Disruption to the occupied building"],
      ["As-built", "Record drawings issued"]
    ]
  },
  "eastside-depot": {
    title: "Ragdale Hall",
    tag: "Steel & Concrete Structures",
    hero: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80",
    intro: "Steel and concrete structures with construction phasing at Ragdale Hall — new frames and slabs sequenced around a live, occupied site.",
    scope: [
      "Steel frame GA drawings and connection details",
      "RC slab and foundation detailing",
      "Construction phasing plans, stage by stage",
      "Interface details with the existing structure"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1517089152318-42ec560349c0?auto=format&fit=crop&w=1100&q=80",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1100&q=80"
    ],
    outcomes: [
      ["Phased", "Built around live operations"],
      ["Steel + RC", "Mixed-frame package"],
      ["Coordinated", "Clash-checked before issue"]
    ]
  },
  "lowfield-reservoir": {
    title: "Cricklewood Broadway",
    tag: "Construction Phasing",
    hero: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1600&q=80",
    intro: "A steel and concrete structures extension on Cricklewood Broadway — new frame, transfer structures and phased construction drawings.",
    scope: [
      "Steel frame and connection detailing",
      "RC slab, beam and foundation details",
      "Phasing and sequence drawings",
      "Existing-structure interface details"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1100&q=80",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1100&q=80"
    ],
    outcomes: [
      ["Extension", "Steel + concrete frame"],
      ["Phased", "Sequenced construction issue"],
      ["0", "Clash-driven RFIs"]
    ]
  },
  "typical-details": {
    title: "Typical Details",
    tag: "Standards · Typical Details",
    hero: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
    intro: "A library of standard structural details — connections, sections and junctions drawn once, checked properly, and reused across projects for consistent, fast delivery.",
    scope: [
      "Standard RC details — slabs, beams, columns and foundations",
      "Steelwork connection and end-plate details",
      "Waterproofing, movement and construction-joint details",
      "Annotation, tagging and sheet standards for reuse"
    ],
    gallery: [
      "img/detail-placeholder.svg",
      "img/detail-placeholder.svg",
      "img/detail-placeholder.svg",
      "img/detail-placeholder.svg",
      "img/detail-placeholder.svg",
      "img/detail-placeholder.svg"
    ],
    outcomes: [
      ["50+", "Standard details in the library"],
      ["1 click", "To place a detail on a sheet"],
      ["Consistent", "Output across every project"]
    ]
  }
};
window.MC_PROJECT_ORDER = ["riverside-bridge", "northgate-tower", "m-corridor", "eastside-depot", "lowfield-reservoir", "typical-details"];
