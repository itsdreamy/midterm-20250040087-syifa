const express = require("express");
const { requireAuth } = require("../middleware");

const router = express.Router();

// Initial Datas
let gardeners = [
  {
    id: 1,
    name: "Nadia Pratama",
    area: "Sukaraja",
    experienceYears: 4,
    specialty: "edible-greens",
    openForSwap: true,
  },
  {
    id: 2,
    name: "Raka Wijaya",
    area: "Cisaat",
    experienceYears: 2,
    specialty: "herbs-spices",
    openForSwap: true,
  },
  {
    id: 3,
    name: "Sari Wulandari",
    area: "Warudoyong",
    experienceYears: 6,
    specialty: "ornamentals",
    openForSwap: false,
  },
  {
    id: 4,
    name: "Dimas Nugroho",
    area: "Baros",
    experienceYears: 3,
    specialty: "berries",
    openForSwap: true,
  },
  {
    id: 5,
    name: "Ayu Lestari",
    area: "Cikole",
    experienceYears: 5,
    specialty: "compost-soil",
    openForSwap: true,
  },
];

let nextId = 6;

// Error Helper with the Code Stat
const makeError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// Validate input
const validateGardener = (body) => {
  if (!body || !body.name || String(body.name).trim() === "") {
    return "name should be filled.";
  }
  if (!body.area || String(body.area).trim() === "") {
    return "area should be filled.";
  }
  if (!body.specialty || String(body.specialty).trim() === "") {
    return "specialty should be filled.";
  }
  if (typeof body.experienceYears !== "number" || body.experienceYears < 0) {
    return "experienceYears should be 0 or more.";
  }
  if (body.openForSwap !== undefined && typeof body.openForSwap !== "boolean") {
    return "openForSwap must be a boolean.";
  }

  return null;
};

// router.route(/) for GET all and adding POST
router
  .route("/")
  .get((req, res) => {
    res.status(200).json({
      total: gardeners.length,
      data: gardeners,
    });
  })
  .post((req, res) => {
    const errorMsg = validateGardener(req.body);
    if (errorMsg) {
      throw makeError(400, errorMsg);
    }

    const newGardener = {
      id: nextId++,
      name: req.body.name.trim(),
      area: req.body.area.trim(),
      experienceYears: req.body.experienceYears,
      specialty: req.body.specialty.trim().toLowerCase(),
      openForSwap:
        req.body.openForSwap !== undefined ? req.body.openForSwap : true,
    };

    gardeners.push(newGardener);

    res.status(201).json({
      message: `${newGardener.name} successfully added.`,
      data: newGardener,
    });
  });

// router.route(/:id) for GET, PUT and Del
router
  .route("/:id")
  .get(async (req, res) => {
    const id = Number(req.params.id);
    const gardener = await Promise.resolve(
      gardeners.find((item) => item.id === id),
    );

    if (!gardener) {
      throw makeError(404, "Gardener Not Found :(");
    }

    res.status(200).json({ data: gardener });
  })
  .put(async (req, res) => {
    const id = Number(req.params.id);
    const errorMsg = validateGardener(req.body);
    if (errorMsg) {
      throw makeError(400, errorMsg);
    }

    let found = false;

    gardeners = await Promise.resolve(
      gardeners.map((item) => {
        if (item.id !== id) return item;
        found = true;
        return {
          ...item,
          name: req.body.name.trim(),
          area: req.body.area.trim(),
          experienceYears: req.body.experienceYears,
          specialty: req.body.specialty.trim().toLowerCase(),
          openForSwap:
            req.body.openForSwap !== undefined
              ? req.body.openForSwap
              : item.openForSwap,
        };
      }),
    );

    if (!found) {
      throw makeError(404, "Gardener Not Found :(");
    }

    const updated = gardeners.find((item) => item.id === id);
    res.status(200).json({
      message: "Gardener is updated.",
      data: updated,
    });
  })
  .delete(requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const index = await Promise.resolve(
      gardeners.findIndex((item) => item.id === id),
    );

    if (index === -1) {
      throw makeError(404, "Gardener Not Found :(");
    }

    const deleted = gardeners.splice(index, 1)[0];
    res.status(200).json({
      message: `${deleted.name} is successfully deleted.`,
      data: deleted,
    });
  });

module.exports = router;
