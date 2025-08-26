const db = require("../testCon"); // Adjust the path to your PostgreSQL connection module

// Get all borrow records
exports.getAllBorrows = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM borrow");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single borrow record by ID
exports.getBorrowById = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM borrow WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Borrow record not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new borrow record
exports.borrowBook = async (req, res) => {
  const { bookId } = req.body;
  const userId = req.user.userid;
  const role = req.user.role_id;

  try {
    const borrowDate = new Date();
    let returnDate;

    if (role === 1) {
      // Teacher: 5 days
      returnDate = new Date(borrowDate.getTime() + 5 * 24 * 60 * 60 * 1000);
    } else if (role === 2) {
      // Student: 3 days
      returnDate = new Date(borrowDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    } else {
      returnDate = new Date(borrowDate.getTime() + 2 * 24 * 60 * 60 * 1000); // default fallback
    }
    const existing = await db.query(
      `SELECT * FROM borrow 
   WHERE user_id = $1 AND book_id = $2 AND status = 'borrowed'`,
      [userId, bookId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        status: "fail",
        message:
          "You have already borrowed this book and haven't returned it yet.",
      });
    }

    const result = await db.query(
      `INSERT INTO borrow (user_id, book_id, borrow_date, return_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, bookId, borrowDate, returnDate]
    );

    res.status(201).json({ status: "success", data: result.rows[0] });
  } catch (err) {
    console.error("Borrow error:", err.message);
    res.status(500).json({ error: "Could not borrow book" });
  }
};

// Update a borrow record
exports.updateBorrow = async (req, res) => {
  const { user, book, borrowDate, returnDate, status } = req.body;
  try {
    const findResult = await db.query("SELECT * FROM borrows WHERE id = $1", [
      req.params.id,
    ]);
    if (findResult.rows.length === 0) {
      return res.status(404).json({ message: "Borrow record not found" });
    }
    const current = findResult.rows[0];
    const result = await db.query(
      "UPDATE borrows SET user_id = $1, book_id = $2, borrow_date = $3, return_date = $4, status = $5 WHERE id = $6 RETURNING *",
      [
        user ?? current.user_id,
        book ?? current.book_id,
        borrowDate ?? current.borrow_date,
        returnDate ?? current.return_date,
        status ?? current.status,
        req.params.id,
      ]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a borrow record
exports.deleteBorrow = async (req, res) => {
  try {
    const findResult = await db.query("SELECT * FROM borrows WHERE id = $1", [
      req.params.id,
    ]);
    if (findResult.rows.length === 0) {
      return res.status(404).json({ message: "Borrow record not found" });
    }
    await db.query("DELETE FROM borrows WHERE id = $1", [req.params.id]);
    res.status(200).json({ message: "Borrow record deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
