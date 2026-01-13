import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.scss";
import * as bootstrap from "bootstrap";

function App() {
    const apiBase = import.meta.env.VITE_API_BASE;
    const apiPath = "kevin-react";
    const [loginForm, setloginForm] = useState({
        username: "sbdrumer1028@gmail.com",
        password: "kv12345",
    });
    const [isChecking, setIsChecking] = useState(true);
    const [isAuth, setIsAuth] = useState(false);
    const [products, setProducts] = useState([]);
    const modalLogin = useRef(null);
    const [modalType, setModalType] = useState("");
    const modalMap = { create: "新增", edit: "編輯", delete: "刪除" };

    const initForm = {
        id: "",
        category: "",
        content: "",
        description: "",
        imageUrl: "",
        imagesUrl: [],
        is_enabled: 0,
        origin_price: 0,
        price: 0,
        title: "",
        unit: "",
    };
    const [productForm, setProductForm] = useState(initForm);

    const loginInputChange = (e) => {
        const { name, value } = e.target;
        setloginForm((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const modalInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProductForm((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        }));
    };

    const apiUser = {
        login: async () => {
            const url = `${apiBase}/admin/signin`;
            try {
                const res = await axios.post(url, loginForm);
                console.log("login res", res);
                if (res.data.success) {
                    const { token, expired } = res.data;
                    document.cookie = `hexToken=${token};expires=${new Date(
                        expired
                    )};`;
                    axios.defaults.headers.common["Authorization"] = token;
                }
                setIsAuth(true);
            } catch (error) {
                console.dir(error);
                setIsAuth(false);
            }
        },
        authLogin: async () => {},
    };

    const apiProduct = {
        get: async () => {
            const url = `${apiBase}/api/${apiPath}/admin/products`;
            try {
                const res = await axios.get(url);
                if (res.data.success) {
                    setProducts(res.data.products);
                }
            } catch (error) {
                console.dir(error);
            }
        },
        post: async (request) => {
            const url = `${apiBase}/api/${apiPath}/admin/product`;
            try {
                return await axios.post(url, request);
            } catch (error) {
                console.dir(error);
            }
        },
        delete: async (pId) => {
            const url = `${apiBase}/api/${apiPath}/admin/product/${pId}`;
            try {
                return await axios.delete(url);
            } catch (error) {
                console.dir(error);
            }
        },
        put: async (request, pId) => {
            const url = `${apiBase}/api/${apiPath}/admin/product/${pId}`;
            try {
                return await axios.put(url, request);
            } catch (error) {
                console.dir(error);
            }
        },
    };

    const userLogin = async (e) => {
        e.preventDefault();
        await apiUser.login();
    };

    const productModalRef = useRef(null);

    useEffect(() => {
        setIsChecking(true);
        // check if login
        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("hexToken="))
            ?.split("=")[1];

        if (token) {
            axios.defaults.headers.common.Authorization = token;
        }
        checkAdmin();

        // init modal
        if (isAuth) {
            // modal 放在內層(助教放外層沒差)，需要先登入才能獲取dom
            const modalElement = document.getElementById("productModal");
            productModalRef.current = new bootstrap.Modal(modalElement);
            console.log("modal ref is", productModalRef);

            // modal arai-hidden issue
            modalElement.addEventListener("hide.bs.modal", () => {
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
            });
        }
    }, [isAuth]);

    const checkAdmin = async () => {
        try {
            const res = await axios.post(`${apiBase}/api/user/check`);
            if (res.data.success) {
                setIsAuth(true);
                await apiProduct.get();
            } else {
                setIsAuth(false);
            }
        } catch (error) {
            console.dir(error);
            setIsAuth(false);
        } finally {
            setIsChecking(false);
        }
    };

    const doImageChange = (index, url) => {
        console.log("doImageChange", index, url);
        setProductForm((prev) => {
            const newImages = [...prev.imagesUrl];
            newImages[index] = url;
            // 未滿五張就加新的input
            if (
                url !== "" &&
                index === newImages.length - 1 &&
                newImages.length < 5
            ) {
                newImages.push("");
            }
            // 2張以上，若有空白的則清除
            if (
                newImages.length > 1 &&
                newImages[newImages.length - 1] === ""
            ) {
                newImages.pop();
            }
            return { ...prev, imagesUrl: newImages };
        });
    };

    const addImage = (e) => {
        console.log("addImage", e);
        setProductForm((prev) => ({
            ...prev,
            imagesUrl: [...prev.imagesUrl, ""],
        }));
    };

    const removeImage = (e) => {
        console.log("removeImage", e);
        setProductForm((prev) => {
            const newImages = [...prev.imagesUrl];
            newImages.pop();
            return { ...prev, imagesUrl: newImages };
        });
    };

    const openModal = (product, type) => {
        // 初始化表單
        console.log("opened", type, product);
        setModalType(type);
        if (type === "create") {
            console.log("AAA");
            setProductForm(initForm); // product === {}
        } else {
            console.log("BBB");
            setProductForm((prev) => {
                console.log("xxx", prev);
                const ss = {
                    ...prev,
                    ...product,
                };
                console.log("yyy", ss);
                return ss;
            });
        }

        console.log("opened 2", productForm);
        productModalRef.current.show();
    };

    const closeModal = () => {
        productModalRef.current.hide();
        setProductForm(initForm);
    };

    const submitModal = async () => {
        // console.log("submitModal", modalType, productForm);
        if (modalType === "create") {
            // create
            const req = {
                data: {
                    ...productForm,
                    origin_price: Number(productForm.origin_price),
                    price: Number(productForm.price),
                },
            };
            console.log(modalType, req);
            const resp = await apiProduct.post(req);
            if (resp.data.success) {
                productModalRef.current.hide();
                await apiProduct.get();
            } else {
                alert(resp.data.message);
            }
        } else if (modalType === "edit") {
            // edit
            const req = {
                data: {
                    ...productForm,
                    origin_price: Number(productForm.origin_price),
                    price: Number(productForm.price),
                },
            };
            console.log(modalType, req);
            const resp = await apiProduct.put(req, req.data.id);
            if (resp.data.success) {
                productModalRef.current.hide();
                await apiProduct.get();
            } else {
                alert(resp.data.message);
            }
        } else if (modalType === "delete") {
            // del
            const req = {
                ...productForm,
            };
            console.log(modalType);
            const resp = await apiProduct.delete(req.id);
            if (resp.data.success) {
                productModalRef.current.hide();
                await apiProduct.get();
            } else {
                alert(resp.data.message);
            }
        }
    };
    const signout = () => {
        console.log("signout");
        document.cookie = "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        delete axios.defaults.headers.common["Authorization"];
        setIsAuth(false);
        setProducts([]);
    };

    return (
        <div className="container-fluid">
            {isChecking ? (
                <>
                    <h1>checking</h1>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </>
            ) : !isAuth ? (
                <div className="row">
                    <h1>Week 3 Homework</h1>
                    <h2>Login</h2>
                    <form
                        ref={modalLogin}
                        className="border p-4 bg-light rounded col-6 offset-3"
                        onSubmit={userLogin}
                        autocomplete="off"
                    >
                        <div className="mb-3 text-start">
                            <label htmlFor="username" className="form-label">
                                Username
                            </label>
                            <input
                                type="email"
                                className="form-control"
                                id="username"
                                name="username"
                                aria-describedby="emailHelp"
                                value={loginForm.username}
                                onChange={(e) => loginInputChange(e)}
                            />
                        </div>
                        <div className="mb-3 text-start">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                name="password"
                                value={loginForm.password}
                                onChange={(e) => loginInputChange(e)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">
                            Sign In
                        </button>
                    </form>
                </div>
            ) : (
                <div className="row border">
                    <div className="col-12 text-end">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={signout}
                        >
                            Sign Out
                        </button>
                    </div>
                    <div className="col-12">
                        <h2>**+::~ Items on Shelf ~::+**</h2>
                        <div className="text-start ms-3 mt-4">
                            <button
                                className="btn btn-primary"
                                onClick={() => openModal({}, "create")}
                            >
                                建立新產品
                            </button>
                        </div>
                        <table className="table table-responsive table-striped">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Category</th>
                                    <th>O.Price</th>
                                    <th>Sale</th>
                                    <th>Active</th>
                                    <th>Detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p.id}>
                                        <td>{p.title}</td>
                                        <td>{p.category}</td>
                                        <td>{p.origin_price}</td>
                                        <td>{p.price}</td>
                                        <td>
                                            <span
                                                className={`${
                                                    p.is_enabled &&
                                                    "text-success"
                                                }`}
                                            >
                                                {p.is_enabled === 1
                                                    ? "yes"
                                                    : "no"}
                                            </span>
                                        </td>
                                        <td>
                                            <div
                                                className="btn-group"
                                                role="group"
                                                aria-label="Basic example"
                                            >
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={() =>
                                                        openModal(p, "edit")
                                                    }
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    onClick={() =>
                                                        openModal(p, "delete")
                                                    }
                                                >
                                                    Del
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <div
                id="productModal"
                className="modal fade"
                tabIndex="-1"
                aria-labelledby="productModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-xl">
                    <div className="modal-content border-0">
                        <div className="modal-header bg-dark text-white">
                            <h5 id="productModalLabel" className="modal-title">
                                <span>{`${modalMap[modalType]}產品`}</span>
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            {modalType === "delete" ? (
                                <div className="row">
                                    <div className="col">
                                        刪除產品編號{" "}
                                        <span className="text-danger">
                                            {productForm.title
                                                ? productForm.title
                                                : "沒選到"}
                                        </span>
                                        嗎?
                                    </div>
                                </div>
                            ) : (
                                <div className="row">
                                    <div className="col-sm-4">
                                        <div className="mb-2">
                                            <div className="mb-3">
                                                <label
                                                    htmlFor="imageUrl"
                                                    className="form-label"
                                                >
                                                    輸入圖片網址
                                                </label>
                                                <input
                                                    name="imageUrl"
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="請輸入圖片連結"
                                                    value={productForm.imageUrl}
                                                    onChange={modalInputChange}
                                                />
                                            </div>
                                            {productForm.imageUrl && (
                                                <img
                                                    className="img-fluid"
                                                    src={productForm.imageUrl}
                                                    alt="主圖"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            {productForm.imagesUrl.length}
                                            張圖
                                            <ul>
                                                {productForm.imagesUrl.map(
                                                    (url, index) => (
                                                        <li
                                                            key={index}
                                                            className="img-thumbnail"
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control mb-1"
                                                                placeholder={`圖片網址 ${
                                                                    index + 1
                                                                }`}
                                                                value={url}
                                                                onChange={(e) =>
                                                                    doImageChange(
                                                                        index,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                            {url && (
                                                                <img
                                                                    src={url}
                                                                    alt="副圖"
                                                                />
                                                            )}
                                                        </li>
                                                    )
                                                )}
                                                <div className="d-flex.justify-content-between">
                                                    {productForm.imagesUrl
                                                        .length < 5 &&
                                                        productForm.imagesUrl[
                                                            productForm
                                                                .imagesUrl
                                                                .length - 1
                                                        ] !== "" && (
                                                            <button
                                                                className="btn btn-outline-primary btn-sm w-100 mx-1"
                                                                onClick={
                                                                    addImage
                                                                }
                                                            >
                                                                加一張圖片
                                                            </button>
                                                        )}
                                                    {productForm.imagesUrl
                                                        .length >= 1 && (
                                                        <button
                                                            className="btn btn-outline-danger btn-sm w-100 mx-1"
                                                            onClick={
                                                                removeImage
                                                            }
                                                        >
                                                            取消圖片
                                                        </button>
                                                    )}
                                                </div>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-sm-8">
                                        <div className="mb-3">
                                            <label
                                                htmlFor="title"
                                                className="form-label"
                                            >
                                                標題
                                            </label>
                                            <input
                                                id="title"
                                                name="title"
                                                type="text"
                                                className="form-control"
                                                placeholder="請輸入標題"
                                                value={productForm.title}
                                                onChange={modalInputChange}
                                            />
                                            {productForm.title}
                                        </div>

                                        <div className="row">
                                            <div className="mb-3 col-md-6">
                                                <label
                                                    htmlFor="category"
                                                    className="form-label"
                                                >
                                                    分類
                                                </label>
                                                <input
                                                    id="category"
                                                    name="category"
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="請輸入分類"
                                                    value={productForm.category}
                                                    onChange={modalInputChange}
                                                />
                                            </div>
                                            <div className="mb-3 col-md-6">
                                                <label
                                                    htmlFor="unit"
                                                    className="form-label"
                                                >
                                                    單位
                                                </label>
                                                <input
                                                    id="unit"
                                                    name="unit"
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="請輸入單位"
                                                    value={productForm.unit}
                                                    onChange={modalInputChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="mb-3 col-md-6">
                                                <label
                                                    htmlFor="origin_price"
                                                    className="form-label"
                                                >
                                                    原價
                                                </label>
                                                <input
                                                    id="origin_price"
                                                    name="origin_price"
                                                    type="number"
                                                    min="0"
                                                    className="form-control"
                                                    placeholder="請輸入原價"
                                                    value={
                                                        productForm.origin_price
                                                    }
                                                    onChange={modalInputChange}
                                                />
                                            </div>
                                            <div className="mb-3 col-md-6">
                                                <label
                                                    htmlFor="price"
                                                    className="form-label"
                                                >
                                                    售價
                                                </label>
                                                <input
                                                    id="price"
                                                    name="price"
                                                    type="number"
                                                    min="0"
                                                    className="form-control"
                                                    placeholder="請輸入售價"
                                                    value={productForm.price}
                                                    onChange={modalInputChange}
                                                />
                                            </div>
                                        </div>
                                        <hr />

                                        <div className="mb-3">
                                            <label
                                                htmlFor="description"
                                                className="form-label d-block text-start"
                                            >
                                                產品描述
                                            </label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                className="form-control"
                                                placeholder="請輸入產品描述"
                                                value={productForm.description}
                                                onChange={modalInputChange}
                                            ></textarea>
                                        </div>
                                        <div className="mb-3">
                                            <label
                                                htmlFor="content"
                                                className="form-label d-block text-start"
                                            >
                                                說明內容
                                            </label>
                                            <textarea
                                                id="content"
                                                name="content"
                                                className="form-control"
                                                placeholder="請輸入說明內容"
                                                value={productForm.content}
                                                onChange={modalInputChange}
                                            ></textarea>
                                        </div>
                                        <div className="mb-3">
                                            <div
                                                className="form-check d-flex
                                                        "
                                            >
                                                <input
                                                    id="is_enabled"
                                                    name="is_enabled"
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={
                                                        productForm.is_enabled ===
                                                        1
                                                    }
                                                    onChange={modalInputChange}
                                                />
                                                <label
                                                    className="form-check-label ms-3"
                                                    htmlFor="is_enabled"
                                                >
                                                    是否啟用
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer d-flex justify-content-center">
                            <button
                                type="button"
                                className="btn btn-outline-secondary px-5"
                                onClick={() => closeModal()}
                            >
                                取消
                            </button>
                            <button
                                type="button"
                                className={`btn ${
                                    modalType === "delete"
                                        ? "btn-danger"
                                        : "btn-primary"
                                } px-5`}
                                onClick={submitModal}
                            >
                                確認
                                {modalType === "delete" ? "刪除" : ""}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
