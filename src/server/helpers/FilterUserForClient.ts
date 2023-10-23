import { type User } from "@clerk/nextjs/dist/types/server";

export const filterUserForClient = (user: User) => {
  //console.log(user)
    return {
      id: user.id,
      username: user.username,
      profileImageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    }
  }