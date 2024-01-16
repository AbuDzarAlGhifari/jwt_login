import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const getUsers = async (req, res) => {
  try {
    // Dapatkan informasi pengguna yang sedang login dari token
    const { userId } = req;

    // Pastikan userId tersedia sebelum menggunakan dalam query
    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Ambil data pengguna yang sesuai dengan informasi dari token
    const user = await Users.findByPk(userId, {
      attributes: ["id", "name", "email"],
    });

    // Periksa apakah pengguna ditemukan
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Kirim data pengguna sebagai respons
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error", error: error.message });
  }
};

export const Register = async (req, res) => {
  const { name, email, password, confPassword } = req.body;

  if (password !== confPassword) {
    return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok" });
  }

  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashPassword = await bcrypt.hash(password, salt);

    await Users.create({
      name,
      email,
      password: hashPassword,
    });

    res.json({ msg: "Register Berhasil" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const Login = async (req, res) => {
  try {
    const user = await Users.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "Email tidak ditemukan" });
    }

    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      return res.status(400).json({ msg: "Wrong Password" });
    }

    const { id: userId, name, email } = user;

    const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '20s',
    });

    const refreshToken = jwt.sign({ userId, name, email }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '1d',
    });

    await Users.update({ refresh_token: refreshToken }, {
      where: {
        id: userId,
      },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const Logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.sendStatus(204);
    }

    const user = await Users.findAll({
      where: {
        refresh_token: refreshToken,
      },
    });

    if (!user) {
      return res.sendStatus(204);
    }

    const userId = user.id;

    await Users.update({ refresh_token: null }, {
      where: {
        id: userId,
      },
    });

    res.clearCookie('refreshToken');
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
