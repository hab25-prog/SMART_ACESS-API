const db = require("../testCon.js");
exports.getAllBooks = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books");
    if (!Array.isArray(result.rows) || result.rows.length === 0) {
      return res.status(404).json({ error: "No books found" });
    }
    res.status(200).json({
      status: "success",
      data: { books: result.rows },
    });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.getBookById = async (req, res) => {
  const bookId = req.params.id;
  try {
    const result = await db.query("SELECT * FROM books WHERE bookId = $1", [
      bookId,
    ]);
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.status(200).json({
      status: "success",
      data: { book: result.rows[0] },
    });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.addBook = async (req, res) => {
  const { title, author, published_year, category_id, file_url } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO books (title, author,  published_year, category_id, file_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING bookId`,
      [title, author, published_year, category_id, file_url]
    );
    if (!result.rows || result.rows.length === 0) {
      return res.status(400).json({ error: "Failed to create book" });
    }
    res.status(201).json({
      status: "success",
      data: { bookId: result.rows[0].bookid },
    });
  } catch (err) {
    console.error("Controller error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.uploadBook = async (req, res) => {
  const { title, author, published_year, category_id } = req.body;
  const file = req.file;
  console.log(req.body, file);

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  console.log(file.path);
  try {
    const result = await db.query(
      `INSERT INTO books (title, author, published_year, category_id, file_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [title, author, published_year * 1, category_id * 1, file.path]
    );

    res.status(201).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (err) {
    console.log("thier is upload error");
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Failed to upload book" });
  }
};
