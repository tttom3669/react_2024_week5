import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Modal } from 'bootstrap';
import ReactLoading from 'react-loading';
import { useForm, useWatch } from 'react-hook-form';

const { VITE_BASE_URL: BASE_URL, VITE_API_PATH: API_PATH } = import.meta.env;

function App() {
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState([]);
  const [cartsData, setCartsData] = useState({});
  const [isScreenLoading, setIsScreenLoading] = useState(false);
  const [isLoading, setIsLoading] = useState({});

  const getProducts = async () => {
    try {
      setIsScreenLoading(true);
      const res = await axios.get(`${BASE_URL}/v2/api/${API_PATH}/products`);
      setProducts(res.data.products);
    } catch (error) {
      alert('取得產品失敗');
    } finally {
      setIsScreenLoading(false);
    }
  };
  const getCarts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/v2/api/${API_PATH}/cart`);
      setCartsData(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const addCart = async (productId, qty = 1) => {
    try {
      setIsLoading({ id: productId, loading: true });
      await axios.post(`${BASE_URL}/v2/api/${API_PATH}/cart`, {
        data: {
          product_id: productId,
          qty,
        },
      });
      getCarts();
      closeModal();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading({ id: productId, loading: false });
    }
  };

  const updateCart = async (cart, qty) => {
    try {
      setIsScreenLoading(true);
      await axios.put(`${BASE_URL}/v2/api/${API_PATH}/cart/${cart.id}`, {
        data: {
          product_id: cart.product_id,
          qty,
        },
      });
      getCarts();
    } catch (error) {
      console.log(error);
    } finally {
      setIsScreenLoading(false);
    }
  };

  const deleteCart = async (cartId) => {
    setIsScreenLoading(true);
    const url = cartId
      ? `${BASE_URL}/v2/api/${API_PATH}/cart/${cartId}`
      : `${BASE_URL}/v2/api/${API_PATH}/carts`;
    try {
      await axios.delete(url);
      getCarts();
    } catch (error) {
      console.log(error);
    } finally {
      setIsScreenLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
    getCarts();
  }, []);

  const productModalRef = useRef(null);
  useEffect(() => {
    new Modal(productModalRef.current, { backdrop: false });
  }, []);

  const openModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.show();
  };

  const closeModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.hide();
  };

  const handleSeeMore = (product) => {
    setTempProduct(product);
    openModal();
  };

  const [qtySelect, setQtySelect] = useState(1);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
  });
  const onSubmit = async (data) => {
    const { name, email, tel, address, message } = data;
    try {
      setIsLoading(true);
      const res = await axios.post(`${BASE_URL}/v2/api/${API_PATH}/order`, {
        data: {
          user: {
            name,
            email,
            tel,
            address,
          },
          message,
        },
      });
      getCarts();
      closeModal();
      alert(res.data.message);
    } catch (error) {
      alert(error.response.data.message);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const watchForm = useWatch({ control });
  useEffect(() => {
    console.log('errors', errors);
  }, [watchForm]);

  return (
    <>
      <div className="container">
        <div className="mt-4">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>圖片</th>
                <th>商品名稱</th>
                <th>價格</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={{ width: '200px' }}>
                    <img
                      className="img-fluid"
                      src={product.imageUrl}
                      alt={product.title}
                    />
                  </td>
                  <td>{product.title}</td>
                  <td>
                    <del className="h6">原價 {product.origin_price} 元</del>
                    <div className="h5">特價 {product.price}元</div>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button
                        onClick={() => handleSeeMore(product)}
                        type="button"
                        className="btn btn-outline-secondary"
                      >
                        查看更多
                      </button>
                      <button
                        type="button"
                        className="d-flex align-content-center gap-2 btn btn-outline-danger"
                        onClick={() => {
                          addCart(product.id);
                        }}
                        disabled={isLoading.loading}
                      >
                        加到購物車
                        {isLoading.id === product.id &&
                          isLoading.loading === true && (
                            <ReactLoading
                              type="spin"
                              color="black"
                              width="1rem"
                              height="1rem"
                            />
                          )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            ref={productModalRef}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            className="modal fade"
            id="productModal"
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title fs-5">
                    產品名稱：{tempProduct.title}
                  </h2>
                  <button
                    onClick={closeModal}
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <img
                    src={tempProduct.imageUrl}
                    alt={tempProduct.title}
                    className="img-fluid"
                  />
                  <p>內容：{tempProduct.content}</p>
                  <p>描述：{tempProduct.description}</p>
                  <p>
                    價錢：{tempProduct.price}{' '}
                    <del>{tempProduct.origin_price}</del> 元
                  </p>
                  <div className="input-group align-items-center">
                    <label htmlFor="qtySelect">數量：</label>
                    <select
                      value={qtySelect}
                      onChange={(e) => setQtySelect(e.target.value)}
                      id="qtySelect"
                      className="form-select"
                    >
                      {Array.from({ length: 10 }).map((_, index) => (
                        <option key={index} value={index + 1}>
                          {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="d-flex align-items-center gap-2 btn btn-primary"
                    onClick={() => addCart(tempProduct.id, Number(qtySelect))}
                    disabled={isLoading.loading}
                  >
                    加入購物車
                    {isLoading.id === tempProduct.id &&
                      isLoading.loading === true && (
                        <ReactLoading
                          className="d-flex align-items-center"
                          type="spin"
                          color="white"
                          width="1rem"
                          height="1rem"
                        />
                      )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-end py-3">
            <button
              className="btn btn-outline-danger"
              type="button"
              onClick={() => deleteCart()}
            >
              清空購物車
            </button>
          </div>

          <table className="table align-middle">
            <thead>
              <tr>
                <th></th>
                <th>品名</th>
                <th style={{ width: '150px' }}>數量/單位</th>
                <th className="text-end">單價</th>
              </tr>
            </thead>

            <tbody>
              {cartsData?.carts &&
                cartsData?.carts.map((cart) => (
                  <tr key={cart.id}>
                    <td>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => deleteCart(cart.id)}
                      >
                        x
                      </button>
                    </td>
                    <td>{cart.product.title}</td>
                    <td style={{ width: '150px' }}>
                      <div className="d-flex align-items-center">
                        <div className="btn-group me-2" role="group">
                          <button
                            type="button"
                            className="btn btn-outline-dark btn-sm"
                            disabled={cart.qty === 1}
                            onClick={() => updateCart(cart, cart.qty - 1)}
                          >
                            -
                          </button>
                          <span
                            className="btn border border-dark"
                            style={{ width: '50px', cursor: 'auto' }}
                          >
                            {cart.qty}
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline-dark btn-sm"
                            onClick={() => updateCart(cart, cart.qty + 1)}
                          >
                            +
                          </button>
                        </div>
                        <span className="input-group-text bg-transparent border-0">
                          {cart.product.unit}
                        </span>
                      </div>
                    </td>
                    <td className="text-end"> {cart.product.price}</td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-end">
                  總計：
                </td>
                <td className="text-end" style={{ width: '130px' }}>
                  {cartsData?.final_total}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="my-5 row justify-content-center">
          <form className="col-md-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`form-control ${errors.email && 'is-invalid'}`}
                placeholder="請輸入 Email"
                {...register('email', {
                  required: {
                    value: true,
                    message: 'Email 為必填',
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/,
                    message: 'Email 格式不正確',
                  },
                })}
              />
              <p className="invalid-feedback my-2">{errors?.email?.message}</p>
            </div>

            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                收件人姓名
              </label>
              <input
                id="name"
                className={`form-control ${errors.name && 'is-invalid'}`}
                placeholder="請輸入姓名"
                {...register('name', {
                  required: {
                    value: true,
                    message: '收件人姓名為必填',
                  },
                })}
              />

              <p className="invalid-feedback my-2">{errors?.name?.message}</p>
            </div>

            <div className="mb-3">
              <label htmlFor="tel" className="form-label">
                收件人電話
              </label>
              <input
                id="tel"
                type="text"
                className={`form-control ${errors.tel && 'is-invalid'}`}
                placeholder="請輸入電話"
                {...register('tel', {
                  required: {
                    value: true,
                    message: '電話為必填',
                  },
                  pattern: {
                    value: /^(0[2-8]\d{7}|09\d{8})$/,
                    message: '電話格式不正確',
                  },
                })}
              />

              <p className="invalid-feedback my-2">{errors?.tel?.message}</p>
            </div>

            <div className="mb-3">
              <label htmlFor="address" className="form-label">
                收件人地址
              </label>
              <input
                id="address"
                type="text"
                className={`form-control ${errors.address && 'is-invalid'}`}
                placeholder="請輸入地址"
                {...register('address', {
                  required: {
                    value: true,
                    message: '地址為必填',
                  },
                })}
              />

              <p className="text-danger my-2">{errors?.address?.message}</p>
            </div>

            <div className="mb-3">
              <label htmlFor="message" className="form-label">
                留言
              </label>
              <textarea
                id="message"
                className="form-control"
                cols="30"
                rows="10"
                {...register('message')}
              ></textarea>
            </div>
            <div className="text-end">
              <button type="submit" className="btn btn-danger">
                送出訂單
              </button>
            </div>
          </form>
        </div>
      </div>

      {isScreenLoading && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(255,255,255,0.3)',
            zIndex: 3000,
          }}
        >
          <ReactLoading type="spin" color="black" width="4rem" height="4rem" />
        </div>
      )}
    </>
  );
}

export default App;
