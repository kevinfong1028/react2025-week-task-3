import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.scss";

function App() {
    const apiBase = import.meta.env.VITE_API_BASE;
    const apiPath = "kevin-react";
    const [formData, setFormData] = useState({
        username: "sbdrumer1028@gmail.com",
        password: "kv12345",
    });
    const [isAuth, setIsAuth] = useState(false);
    const [products, setProducts] = useState([]);
    const [isChecked, setIsChecked] = useState(false);
    const [inputUrl, setInputUrl] = useState("");
    const [actType, setactType] = useState(1);
    const actMethods = [null, "新增", "編輯", "刪除"];
    const modalAdd = useRef(null);
    const doInputChange = (e) => {
        const { name, value } = e.target;
        console.log("change:", name, value);
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    const modalInputChange = (e) => {
        const { name, value } = e.target;
        console.log("change:", name, value);
        setProductForm((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    const initForm = {
        category: "",
        content: "",
        description: "",
        id: "",
        imageUrl: "",
        imagesUrl: [],
        is_enabled: 1,
        origin_price: 0,
        price: 0,
        title: "",
        unit: "",
        num: 0,
    };
    const [productForm, setProductForm] = useState(initForm);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log("handleInputChange name =", name, "v=", value);
    };
    const apiUser = {
        login: async () => {
            const url = `${apiBase}/admin/signin`;
            try {
                const res = await axios.post(url, formData);
                // console.log(res);
                const { token, expired } = res.data;
                document.cookie = `hexToken=${token};expires=${new Date(
                    expired
                )};`;
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
                console.log("get res", res);
                if (res.data.success) {
                    setProducts(res.data.products);
                }
            } catch (error) {
                console.dir(error);
            }
        },
        post: async (sendData) => {
            const url = `${apiBase}/api/${apiPath}/admin/product`;
            try {
                const res = await axios.post(url, sendData);
                console.log("post res", res);
                if (res.data.success) {
                    apiProduct.get();
                }
            } catch (error) {
                console.dir(error);
            }
        },
        del: async () => {
            const url = `${apiBase}/api/${apiPath}/admin/product/${pId}`;
            try {
                const res = await axios.get(url);
                console.log("del res", res);
                if (res.data.success) {
                    setProducts(res.data.products);
                }
            } catch (error) {
                console.dir(error);
            }
        },
        put: async () => {
            const url = `${apiBase}/api/${apiPath}/admin/product/${pId}`;
            try {
                const res = await axios.get(url);
                console.log("put res", res);
                if (res.data.success) {
                    setProducts(res.data.products);
                }
            } catch (error) {
                console.dir(error);
            }
        },
    };

    // const getProducts = async () => {
    //     const url = `${apiBase}/api/${apiPath}/products/all`;
    //     try {
    //         const res = await axios.get(url);
    //         console.log("getProducts", res);
    //         if (res.data.success) {
    //             setProducts(res.data.products);
    //         }
    //     } catch (error) {
    //         console.dir(error);
    //     }
    // };

    const userLogin = async (e) => {
        e.preventDefault();
        apiUser.login();
    };

    const checkLogin = async () => {
        console.log("checkLogin cookie:", document.cookie.split("; "));
        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("hexToken="))
            ?.split("=")[1];

        axios.defaults.headers.common["Authorization"] = token;
        try {
            const url = `${apiBase}/api/user/check`;
            const res = await axios.post(url);
            console.log("checkLogin", res);
            if (res.data.success) {
                setIsChecked(true);
                // getProducts();
                apiProduct.get();
            } else {
                setIsChecked(false);
            }
        } catch (error) {
            console.dir(error);
            setIsChecked(false);
        }
    };

    // checkLogin();

    // const [chosenProduct, setChosenProduct] = useState(null);

    // useEffect(() => {
    //     fetchData("/data.json").then((res) => {
    //         setProducts(res);
    //     });
    // }, []);
    // console.log("products", products);

    // const showDetail = (id) => {
    //     const matchProduct = products.find((item) => item.id === id);
    //     setChosenProduct(matchProduct);
    //     console.log("chosenProduct", matchProduct);
    // };

    const concatUrls = () => {
        setProductForm((prev) => ({
            ...prev,
            imagesUrl: [...prev.imagesUrl, inputUrl],
        }));
        console.log("concatUrls", productForm.imagesUrl);
    };

    const createData = () => {
        console.log("createData");
        setactType(1);
        setProductForm(initForm);
    };

    const editData = (p) => {
        console.log("editData", p);
        setactType(2);
        setProductForm({
            category: p.category,
            content: p.content,
            description: p.description,
            id: p.id,
            imageUrl: p.imageUrl,
            imagesUrl: p.imagesUrl,
            is_enabled: p.is_enabled,
            origin_price: p.origin_price,
            price: p.price,
            title: p.title,
            unit: p.unit,
            num: p.num,
        });
    };

    const delData = (p) => {
        console.log("delData", p);
        setactType(3);
    };

    const submitModal = async () => {
        console.log("submitModal", actType, productForm);
        if (actType === 1) {
            // create
            apiProduct.post();
        } else if (actType === 2) {
            // edit
            apiProduct.put();
        } else if (actType === 3) {
            // del
            apiProduct.delete();
        }
    };

    return (
        <div className="container-fluid">
            {!isAuth ? (
                <div className="row">
                    <h1>Week 3 Homework</h1>
                    <h2>Login</h2>
                    <form
                        ref={modalAdd}
                        className="border p-4 bg-light rounded col-6 offset-3"
                        onSubmit={userLogin}
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
                                value={formData.username}
                                onChange={(e) => doInputChange(e)}
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
                                value={formData.password}
                                onChange={(e) => doInputChange(e)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">
                            Sign In
                        </button>
                    </form>
                </div>
            ) : (
                <div className="container">
                    <div className="row border">
                        <div className="col-12 pt-3">
                            <button className="mb-3" onClick={checkLogin}>
                                Check Login first, than download products
                            </button>
                        </div>
                        <div className="col-12">
                            <h2>Items on Shelf</h2>
                            <div className="text-start ms-3 mt-4">
                                <button
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#productModal"
                                    onClick={() => createData()}
                                >
                                    建立新的產品
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
                                                {p.is_enabled ? "yes" : "no"}
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#productModal"
                                                    onClick={() => editData(p)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#productModal"
                                                    onClick={() => delData(p)}
                                                >
                                                    Del
                                                </button>
                                                {/* <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#productModal"
                                                    onClick={() =>
                                                        showDetail(p.id)
                                                    }
                                                >
                                                    show
                                                </button> */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
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
                                    <h5
                                        id="productModalLabel"
                                        className="modal-title"
                                    >
                                        <span>{`${actMethods[actType]}產品`}</span>
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    ></button>
                                </div>
                                {actType === 3 ? (
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-sm-4">
                                                刪除產品編號{" "}
                                                <span className="text-danger">
                                                    {productForm.title
                                                        ? productForm.title
                                                        : "沒選到"}
                                                </span>
                                                嗎?
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="modal-body">
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
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="請輸入圖片連結"
                                                            onChange={(e) => {
                                                                setInputUrl(
                                                                    e.target
                                                                        .value
                                                                );
                                                            }}
                                                        />
                                                        {inputUrl}
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <button
                                                        className="btn btn-outline-primary btn-sm d-block w-100 mx-1"
                                                        onClick={concatUrls}
                                                    >
                                                        新增圖片
                                                    </button>
                                                    <button className="btn btn-outline-danger btn-sm d-block w-100 mx-1">
                                                        刪除圖片
                                                    </button>
                                                </div>
                                                <ul className="d-flex flex-column">
                                                    {productForm.imagesUrl.map(
                                                        (url) => {
                                                            return (
                                                                <li
                                                                    className="img-thumbnail"
                                                                    key={url}
                                                                >
                                                                    <img
                                                                        src={
                                                                            url
                                                                        }
                                                                        alt=""
                                                                    />
                                                                </li>
                                                            );
                                                        }
                                                    )}
                                                </ul>
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
                                                        value={
                                                            productForm.title
                                                        }
                                                        onChange={(e) =>
                                                            modalInputChange(e)
                                                        }
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
                                                            autoComplete="off"
                                                            className="form-control"
                                                            placeholder="請輸入分類"
                                                            value={
                                                                productForm.category
                                                            }
                                                            onChange={(e) =>
                                                                modalInputChange(
                                                                    e
                                                                )
                                                            }
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
                                                            value={
                                                                productForm.unit
                                                            }
                                                            onChange={(e) =>
                                                                modalInputChange(
                                                                    e
                                                                )
                                                            }
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
                                                            onChange={(e) =>
                                                                modalInputChange(
                                                                    e
                                                                )
                                                            }
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
                                                            value={
                                                                productForm.price
                                                            }
                                                            onChange={(e) =>
                                                                modalInputChange(
                                                                    e
                                                                )
                                                            }
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
                                                        value={
                                                            productForm.description
                                                        }
                                                        onChange={(e) =>
                                                            modalInputChange(e)
                                                        }
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
                                                        value={
                                                            productForm.content
                                                        }
                                                        onChange={(e) =>
                                                            modalInputChange(e)
                                                        }
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
                                                            onChange={(e) =>
                                                                modalInputChange(
                                                                    e
                                                                )
                                                            }
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
                                    </div>
                                )}
                                <div className="modal-footer d-flex justify-content-center">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary px-5"
                                        data-bs-dismiss="modal"
                                    >
                                        取消
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary px-5"
                                        onClick={submitModal}
                                    >
                                        確認
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
