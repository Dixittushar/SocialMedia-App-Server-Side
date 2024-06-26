import UserModel from "../Models/userModel.js";
import bcrypt from "bcrypt";
//get a user
export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await UserModel.findById(id);
    if (user) {
      const { password, ...otherDetails } = user._doc;
      res.status(200).json(otherDetails);
    } else {
      res.status(404).json("User does not exist");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

//update user
export const updateUser = async (req, res) => {
  const id = req.params.id;

  const { currentUserId, currentUserAdminStatus, password } = req.body;
  if (id === currentUserId || currentUserAdminStatus) {
    try {
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }
      const user = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("Access Denied! You can update your own profile");
  }
};

//delete a user
export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId, currentUserAdminStatus } = req.body;
  if (currentUserId === id || currentUserAdminStatus) {
    try {
      const user = await UserModel.findByIdAndDelete(id);
      if (user) {
        res.status(200).json("User Deleted Successfully");
      } else {
        res.status(404).json("User does not exist");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("Access Denied! You can delete your own profile");
  }
};

//follow a user
// export const followUser = async (req, res) => {
//   const id = req.params.id;
//   const { currentUserId } = req.body;
//   if (currentUserId === id) {
//     res.status(403).json("Action forbidden");
//   } else {
//     try {
//       const followUser = await UserModel.findById(id);
//       const followingUser = await UserModel.findById(currentUserId);

//       if (!followUser.followers.includes(currentUserId)) {
//         await followUser.updateOne({ $push: { followers: currentUserId } });
//         await followingUser.updateOne({ $push: { following: id } });
//         res.send(200).json("user followed!");
//       } else {
//         res.status(403).json("User is already followed by you");
//       }
//     } catch (error) {
//       res.status(500).json(error);
//     }
//   }
// };

export const followUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId } = req.body;

  if (id === currentUserId) {
    res.status(403).json("Forbidden");
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(currentUserId);
      if (!followUser.following.includes(currentUserId)) {
        await followUser.updateOne({
          $push: { following: currentUserId },
        });
        await followingUser.updateOne({ $push: { followers: id } });

        res.status(200).json("User followed");
      } else {
        res.status(403).json("Already following");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

export const unfollowUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId } = req.body;

  if (id === currentUserId) {
    res.status(403).json("Action forbidden");
  } else {
    try {
      const unfollowUser = await UserModel.findById(id);
      const unfollowingUser = await UserModel.findById(currentUserId);

      if (unfollowUser.following.includes(currentUserId)) {
        await unfollowUser.updateOne({ $pull: { following: currentUserId } });
        await unfollowingUser.updateOne({ $pull: { followers: id } });

        res.status(200).json("Unfollowed the User");
      } else if (!unfollowUser.following.includes(currentUserId)) {
        res
          .status(403)
          .json(
            "Action cannot be performed as no such user exists to unfollow"
          );
      } else {
        res.status(403).json("User already unfollowed");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};
