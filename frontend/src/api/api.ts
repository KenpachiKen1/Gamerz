const BASE_URL = " ";

export const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

export const getProfile = async () => {
    const res = await fetch(`${BASE_URL}/users/profile`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    return res.json();
};

export const createAccount = async (data: any) => {
    const res = await fetch(`${BASE_URL}/users/create_account`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return res.json();
};

export const createWishlist = async (name: string) => {
    const res = await fetch(`${BASE_URL}/wishlists/create_wishlist`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ wishlist_name: name }),
    });

    return res.json();
};

