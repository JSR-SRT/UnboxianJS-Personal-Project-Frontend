import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { createOrder } from "@/services/orderApi";
import { getUserProfile } from "@/services/userApi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const CheckoutPage = () => {
  const { cartItems: initialCartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState(initialCartItems);
  const [loading, setLoading] = useState(false); // loading state
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile จาก Backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getUserProfile();
        if (data.error === false) {
          setUserProfile(data.user);

          setFormData({
            firstName: data.user.firstName || "",
            lastName: data.user.lastName || "",
            email: data.user.email || "",
            phoneNumber: data.user.phoneNumber || "",
            contactOption: "saved",
            shippingAddress: data.user.shippingAddress || "",
            addressOption: "saved",
            paymentMethod: "card",
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.error("Failed to load profile.");
      }
    };

    loadProfile();
  }, []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    contactOption: "saved",
    shippingAddress: "",
    addressOption: "saved",
    paymentMethod: "card",
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );
  const deliveryFee = subtotal > 0 ? 50 : 0;
  const total = subtotal + deliveryFee;

  const generateOrderId = () => {
    return "ORD-" + Math.floor(10000 + Math.random() * 90000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleContactOptionChange = (value) => {
    if (!userProfile) return;

    setFormData((prevState) => ({
      ...prevState,
      contactOption: value,
      firstName: value === "saved" ? userProfile.firstName : "",
      lastName: value === "saved" ? userProfile.lastName : "",
      email: value === "saved" ? userProfile.email : "",
      phoneNumber: value === "saved" ? userProfile.phoneNumber : "",
    }));
  };

  const handleDeliveryOptionChange = (value) => {
    if (!userProfile) return;

    setFormData((prevState) => ({
      ...prevState,
      addressOption: value,
      shippingAddress: value === "saved" ? userProfile.shippingAddress : "",
    }));
  };

  const handlePaymentMethodChange = (value) => {
    setFormData((prevState) => ({ ...prevState, paymentMethod: value }));
  };

  const handleRemoveItem = (id) => {
    const updatedCart = cartItems.filter((item) => item._id !== id);
    setCartItems(updatedCart);
  };

  // handleCheckout ให้ส่งข้อมูลไป Backend
  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderId = generateOrderId();

    const orderPayload = {
      id: orderId,
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        shippingAddress: formData.shippingAddress,
        paymentMethod: formData.paymentMethod,
      },
      cart: cartItems,
      subtotal,
      shipping: deliveryFee,
      total,
    };

    try {
      const data = await createOrder(orderPayload);

      if (data.error === false) {
        toast.success("Order placed successfully!");
        clearCart();
        navigate("/order-confirmation", { state: { orderData: orderPayload } });
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-10 text-black">
      <h1 className="text-4xl font-bold mb-8 text-center">CHECKOUT</h1>

      <form
        onSubmit={handleCheckout}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4"
      >
        {/* ฟอร์ม checkout */}
        <div className="lg:col-span-3 space-y-8">
          <Card className="p-6 bg-[#fdf6ec]">
            <h2 className="text-xl font-bold mb-4">CONTACT INFORMATION</h2>
            <RadioGroup
              onValueChange={handleContactOptionChange}
              defaultValue="saved"
              className="space-y-4 mb-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="saved" id="saved-info" />
                <Label htmlFor="saved-info">Use saved info</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new-info" />
                <Label htmlFor="new-info">Add new info</Label>
              </div>
            </RadioGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="First name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={formData.contactOption === "saved"}
                required
              />
              <Input
                type="text"
                placeholder="Last name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={formData.contactOption === "saved"}
                required
              />
              <Input
                type="email"
                placeholder="E-mail"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="md:col-span-2"
                disabled={formData.contactOption === "saved"}
                required
              />
              <Input
                type="text"
                placeholder="Phone"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="md:col-span-2"
                disabled={formData.contactOption === "saved"}
                required
              />
            </div>
          </Card>

          <Card className="p-6 bg-[#fdf6ec]">
            <h2 className="text-xl font-bold mb-4">DELIVERY</h2>
            <RadioGroup
              onValueChange={handleDeliveryOptionChange}
              defaultValue="saved"
              className="space-y-4 mb-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="saved" id="saved-address" />
                <Label htmlFor="saved-address">Use saved address</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new-address" />
                <Label htmlFor="new-address">Add new address</Label>
              </div>
            </RadioGroup>
            <Textarea
              placeholder="Address"
              name="shippingAddress"
              value={formData.shippingAddress}
              onChange={handleInputChange}
              className="w-full h-32 resize-none"
              disabled={formData.addressOption === "saved"}
              required
            />
          </Card>

          <Card className="p-6 bg-[#fdf6ec]">
            <h2 className="text-xl font-bold mb-4">PAYMENT METHOD</h2>
            <RadioGroup
              onValueChange={handlePaymentMethodChange}
              defaultValue="card"
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card">Credit Card</Label>
              </div>
              {formData.paymentMethod === "card" && (
                <div className="space-y-4 pl-6">
                  <Input
                    type="text"
                    placeholder="Card number"
                    className="w-full"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input type="text" placeholder="MM/YY" />
                    <Input type="text" placeholder="CVC" />
                  </div>
                  <Input type="text" placeholder="Name on card" />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank">Bank Transfer</Label>
              </div>
              {formData.paymentMethod === "bank" && (
                <div className="space-y-2 pl-6">
                  <p>
                    Account Name:{" "}
                    <span className="font-semibold">Jittawee S.</span>
                  </p>
                  <p>
                    Account Number:{" "}
                    <span className="font-semibold">929-9-03434-9</span>
                  </p>
                  <p>
                    Bank: <span className="font-semibold">Bangkok</span>
                  </p>
                </div>
              )}
            </RadioGroup>
          </Card>
        </div>

        {/* สรุปรายการ */}
        <div className="bg-[#fdf6ec] rounded-xl shadow-lg p-6 space-y-4 lg:col-span-2">
          <h2 className="text-xl font-bold mb-3">
            YOUR ORDER ({cartItems.length})
          </h2>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex items-start justify-between border-b pb-4"
              >
                <div className="flex space-x-5">
                  <img
                    src={item.mainImage}
                    alt={item.name}
                    className="w-20 h-20 object-contain rounded-md"
                  />
                  <div className="flex flex-col space-x-5">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      Qty: {item.qty}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col text-right items-end w-1/3 md:w-1/3">
                  <p className="text-sm md:text-base font-semibold">
                    ฿{Number(item.price).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item._id)}
                    className="text-stone-400 hover:text-stone-700 mt-2"
                    aria-label="Remove item"
                    type="button"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 text-sm">
            <p className="flex justify-between">
              <span className="text-stone-600">Subtotal</span>
              <span className="font-medium">฿{subtotal.toLocaleString()}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-stone-600">Shipping</span>
              <span className="font-medium">
                ฿{deliveryFee.toLocaleString()}
              </span>
            </p>
            <Separator className="bg-black my-2" />
            <p className="flex justify-between text-base font-bold">
              <span>TOTAL</span>
              <span>฿{total.toLocaleString()}</span>
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-black text-[#fdf6ec] py-3 font-semibold hover:bg-stone-400 hover:text-black"
            disabled={loading || cartItems.length === 0}
          >
            {loading ? "PROCESSING..." : "PAY NOW"}
          </Button>
        </div>
      </form>
    </div>
  );
};
