const express = require("express");
const { requireAuth } = require("../middleware");

const router = express.Router();

// Initial Datas
let plants = [
  {
    id: 1,
    commonName: "Kale Nero",
    category: "edible",
    lightNeeds: "full-sun",
    availableCount: 8,
    containerType: "polybag",
    listingType: "sell",
    price: 12000,
  },
  {
    id: 2,
    commonName: "Cabe Rawit",
    category: "herb",
    lightNeeds: "full-sun",
    availableCount: 15,
    containerType: "seed-pack",
    listingType: "free",
    price: 0,
  },
  {
    id: 3,
    commonName: "Raspberry",
    category: "berry",
    lightNeeds: "partial-shade",
    availableCount: 4,
    containerType: "pot",
    listingType: "swap",
    price: 0,
  },
  {
    id: 4,
    commonName: "Aloe Vera",
    category: "ornamental",
    lightNeeds: "partial-shade",
    availableCount: 6,
    containerType: "pot",
    listingType: "sell",
    price: 15000,
  },
  {
    id: 5,
    commonName: "Peppermint",
    category: "herb",
    lightNeeds: "partial-shade",
    availableCount: 10,
    containerType: "polybag",
    listingType: "swap",
    price: 0,
  },
];

let nextId = 6;

// error with statuscode
const makeError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// Validate input
const validatePlant = (body) => {
  if (!body || !body.commonName || String(body.commonName).trim() === "") {
    return "commonName should be filled.";
  }
  if (!body.category || String(body.category).trim() === "") {
    return "category should be filled.";
  }
  if (!body.lightNeeds || String(body.lightNeeds).trim() === "") {
    return "lightNeeds should be filled.";
  }
  if (typeof body.availableCount !== "number" || body.availableCount < 0) {
    return "availableCount should be 0 or more.";
  }

  const listingType = body.listingType || "swap";
  if (!["swap", "free", "sell"].includes(listingType)) {
    return "listingType should either swap, free, or sell.";
  }

  if (
    listingType === "sell" &&
    (typeof body.price !== "number" || body.price <= 0)
  ) {
    return "if listingType is sell, price should be more than 0.";
  }

  return null;
};

//specific routings before /:id
router.get("/category{/:name}", (req, res) => {
  const name = req.params.name;

  if (!name) {
    return res.status(200).json({
      total: plants.length,
      data: plants,
    });
  }

  const keyword = name.toLowerCase();
  const filtered = plants.filter(
    (item) =>
      item.category.toLowerCase() === keyword ||
      item.lightNeeds.toLowerCase() === keyword ||
      item.listingType.toLowerCase() === keyword,
  );

  res.status(200).json({
    filter: name,
    total: filtered.length,
    data: filtered,
  });
});

//Query String Search
router.get("/search", (req, res) => {
  const q = req.query.q ? String(req.query.q).toLowerCase() : "";
  const listingType = req.query.listingType
    ? String(req.query.listingType).toLowerCase()
    : "";

  const results = plants.filter((item) => {
    const matchName = !q || item.commonName.toLowerCase().includes(q);
    const matchType =
      !listingType || item.listingType.toLowerCase() === listingType;
    return matchName && matchType;
  });

  res.status(200).json({
    total: results.length,
    data: results,
  });
});

//router.route(/) for all GET and add POST
router
  .route("/")
  .get((req, res) => {
    res.status(200).json({
      total: plants.length,
      data: plants,
    });
  })
  .post((req, res) => {
    const errorMsg = validatePlant(req.body);
    if (errorMsg) {
      throw makeError(400, errorMsg);
    }

    const listingType = req.body.listingType || "swap";
    const newItem = {
      id: nextId++,
      commonName: req.body.commonName.trim(),
      category: req.body.category.trim().toLowerCase(),
      lightNeeds: req.body.lightNeeds.trim().toLowerCase(),
      availableCount: req.body.availableCount,
      containerType: (req.body.containerType || "polybag").trim().toLowerCase(),
      listingType,
      price: listingType === "sell" ? req.body.price : 0,
    };

    plants.push(newItem);

    res.status(201).json({
      message: `${newItem.commonName} successfully added.`,
      data: newItem,
    });
  });

//router.route(/:id) for GET, PUT, and delete
router
  .route("/:id")
  .get(async (req, res) => {
    const id = Number(req.params.id);
    const plant = await Promise.resolve(plants.find((item) => item.id === id));

    if (!plant) {
      throw makeError(404, "Plant Not Found :(");
    }

    res.status(200).json({ data: plant });
  })
  .put(async (req, res) => {
    const id = Number(req.params.id);
    const errorMsg = validatePlant(req.body);
    if (errorMsg) {
      throw makeError(400, errorMsg);
    }

    const listingType = req.body.listingType || "swap";
    let found = false;

    //use .map to change the suitable item
    plants = await Promise.resolve(
      plants.map((item) => {
        if (item.id !== id) return item;
        found = true;
        return {
          ...item,
          commonName: req.body.commonName.trim(),
          category: req.body.category.trim().toLowerCase(),
          lightNeeds: req.body.lightNeeds.trim().toLowerCase(),
          availableCount: req.body.availableCount,
          containerType: (req.body.containerType || item.containerType)
            .trim()
            .toLowerCase(),
          listingType,
          price: listingType === "sell" ? req.body.price : 0,
        };
      }),
    );

    if (!found) {
      throw makeError(404, "Plant Not Found :(");
    }

    const updated = plants.find((item) => item.id === id);
    res.status(200).json({
      message: "Plant is updated.",
      data: updated,
    });
  })
  .delete(requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const index = await Promise.resolve(
      plants.findIndex((item) => item.id === id),
    );

    if (index === -1) {
      throw makeError(404, "Plant Not Found :(");
    }

    const deleted = plants.splice(index, 1)[0];
    res.status(200).json({
      message: `${deleted.commonName} is successfully deleted.`,
      data: deleted,
    });
  });

module.exports = router;
