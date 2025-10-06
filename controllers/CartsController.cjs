const Carts = require("../models/Carts.cjs");
const express = require("express");
const router = express.Router();

// GET route to retrieve cart by sessionId from headers
router.get("/", async (req, res) => {
  try {
    const sessionId = req.headers["session-id"];

    if (!sessionId) {
      return res.status(400).json({ message: "Session-Id header is required" });
    }

    const cart = await Carts.findOne({ sessionId, status: "active" });
    if (!cart) {
      return res.status(404).json({ cart: null, message: "Cart not found" });
    }

    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.post("/", async (req, res) => {
  try {
    const { _id, name, price } = req.body;
    const sessionId = req.headers["session-id"];

    if (!sessionId) {
      return res.status(400).json({ message: "Session-Id header is required" });
    }

    let cart = await Carts.findOne({ sessionId, status: "active" });
    if (cart) {
      // Update existing active cart
      if (cart.items.find((item) => item.foodId.toString() === _id)) {
        cart.items = cart.items.map((item) => {
          if (item.foodId.toString() === _id) {
            item.quantity += 1;
          }
          return item;
        });
      } else {
        cart.items.push({ foodId: _id, name, price, quantity: 1 });
      }
      cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      cart.updatedAt = Date.now();
      await cart.save();
    } else {
      // Create new cart
      const items = [{ foodId: _id, name, price, quantity: 1 }];
      const totalPrice = price;
      cart = new Carts({ items, totalPrice, sessionId });
      await cart.save();
    }
    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// PATCH route to increment item quantity
router.patch("/items/:foodId/increment", async (req, res) => {
  try {
    const { foodId } = req.params;
    const sessionId = req.headers["session-id"];

    if (!sessionId) {
      return res.status(400).json({ message: "Session-Id header is required" });
    }

    let cart = await Carts.findOne({ sessionId, status: "active" });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find and increment item quantity
    const itemIndex = cart.items.findIndex(
      (item) => item.foodId.toString() === foodId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity += 1;
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// PATCH route to decrement item quantity
router.patch("/items/:foodId/decrement", async (req, res) => {
  try {
    const { foodId } = req.params;
    const sessionId = req.headers["session-id"];

    if (!sessionId) {
      return res.status(400).json({ message: "Session-Id header is required" });
    }

    let cart = await Carts.findOne({ sessionId, status: "active" });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find item and decrement quantity
    const itemIndex = cart.items.findIndex(
      (item) => item.foodId.toString() === foodId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Decrease quantity or remove item if quantity becomes 0
    if (cart.items[itemIndex].quantity > 1) {
      cart.items[itemIndex].quantity -= 1;
    } else {
      cart.items.splice(itemIndex, 1);
    }

    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// PATCH route to update cart status
router.patch("/status", async (req, res) => {
  try {
    const { _id, status } = req.body;
    const sessionId = req.headers["session-id"];

    if (!sessionId) {
      return res.status(400).json({ message: "Session-Id header is required" });
    }

    // Find and update cart
    const cart = await Carts.findOneAndUpdate(
      { _id, sessionId },
      {
        status,
        updatedAt: Date.now()
      },
      { new: true } // Return updated document
    );

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({
      cart,
      message: `Cart status updated to ${status}`
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.delete("/items/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const sessionId = req.headers["session-id"];

    if (!sessionId) {
      return res.status(400).json({ message: "Session-Id header is required" });
    }

    let cart = await Carts.findOne({ sessionId, status: "active" });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    cart.items = cart.items.filter((item) => item.foodId.toString() !== itemId);
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    cart.updatedAt = Date.now();
    await cart.save();
    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
