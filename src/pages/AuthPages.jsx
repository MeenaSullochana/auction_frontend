import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import Logo from "../components/Logo";

const countries = [{ country: "India", dial_code: "+91", code: "IN" }, { country: "United States", dial_code: "+1", code: "US" }, { country: "United Kingdom", dial_code: "+44", code: "GB" }, { country: "United Arab Emirates", dial_code: "+971", code: "AE" }];

export function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="auth-wrap">
      <div className="card auth-card" style={{ width: 420 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}><Logo to="/" size="lg" /></div>
        <h2>Vendor Sign In</h2>
        {err && <div className="alert err">{err}</div>}
        <form onSubmit={async (e) => {
          e.preventDefault();
          setErr("");
          try {
            const data = await api("/auth/login", { method: "POST", body: form });
            localStorage.setItem("user_token", data.token);
            setUser(data.user);
            navigate("/user/dashboard");
          } catch (ex) { setErr(ex.message); }
        }}>
          <div className="field"><label>Username or Email</label><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
          <div className="field" style={{ marginTop: 10 }}><label>Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          <button className="btn btn-gold full" style={{ marginTop: 18 }}>Login</button>
        </form>
        <p><Link className="link" to="/password/reset">Forgot password?</Link></p>
        <p className="lead" style={{ marginTop: 8 }}>Vendor / company enrolment is handled by our desk after Contact enquiry.</p>
      </div>
    </div>
  );
}

export function Register() {
  const [form, setForm] = useState({ firstname: "", lastname: "", country: "India", country_code: "IN", mobile_code: "+91", mobile: "", username: "", email: "", password: "", password_confirmation: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}><Logo to="/" size="lg" /></div>
        <h2>Sign Up</h2>
        {msg && <div className="alert ok">{msg}</div>}
        {err && <div className="alert err">{err}</div>}
        <form onSubmit={async (e) => {
          e.preventDefault();
          setErr(""); setMsg("");
          try {
            const data = await api("/auth/register", { method: "POST", body: form });
            setMsg(data.message);
          } catch (ex) { setErr(ex.message); }
        }}>
          <div className="form-grid">
            <div className="field"><label>Firstname</label><input name="firstname" required onChange={onChange} /></div>
            <div className="field"><label>Lastname</label><input name="lastname" required onChange={onChange} /></div>
            <div className="field"><label>Country</label>
              <select name="country" value={form.country} onChange={(e) => {
                const c = countries.find((x) => x.country === e.target.value);
                setForm({ ...form, country: c.country, country_code: c.code, mobile_code: c.dial_code });
              }}>
                {countries.map((c) => <option key={c.code}>{c.country}</option>)}
              </select>
            </div>
            <div className="field"><label>Mobile</label><input name="mobile" required onChange={onChange} /></div>
            <div className="field"><label>Username</label><input name="username" required onChange={onChange} /></div>
            <div className="field"><label>E-Mail Address</label><input name="email" required onChange={onChange} /></div>
            <div className="field"><label>Password</label><input type="password" name="password" required onChange={onChange} /></div>
            <div className="field"><label>Confirm Password</label><input type="password" name="password_confirmation" required onChange={onChange} /></div>
          </div>
          <button className="btn btn-gold full" style={{ marginTop: 18 }}>Register</button>
        </form>
        <p>Already have an Account? <Link className="link" to="/login">Login</Link></p>
      </div>
    </div>
  );
}

export function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="auth-wrap">
      <div className="card" style={{ width: 420 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}><Logo to="/" size="lg" /></div>
        <h2>Password Reset</h2>
        {msg && <div className="alert ok">{msg}</div>}
        {err && <div className="alert err">{err}</div>}
        {step === 1 && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              const data = await api("/auth/password/email", { method: "POST", body: { email } });
              setMsg(`${data.message}. Code: ${data.code}`);
              setStep(2);
            } catch (ex) { setErr(ex.message); }
          }}>
            <div className="field"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <button className="btn btn-gold full" style={{ marginTop: 16 }}>Send Code</button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api("/auth/password/verify-code", { method: "POST", body: { email, code } });
              setStep(3);
            } catch (ex) { setErr(ex.message); }
          }}>
            <div className="field"><label>Code</label><input value={code} onChange={(e) => setCode(e.target.value)} required /></div>
            <button className="btn btn-gold full" style={{ marginTop: 16 }}>Verify</button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              const data = await api("/auth/password/reset", { method: "POST", body: { email, token: code, password, password_confirmation } });
              setMsg(data.message);
            } catch (ex) { setErr(ex.message); }
          }}>
            <div className="field"><label>New password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            <div className="field"><label>Confirm</label><input type="password" value={password_confirmation} onChange={(e) => setConfirm(e.target.value)} required /></div>
            <button className="btn btn-gold full" style={{ marginTop: 16 }}>Update Password</button>
          </form>
        )}
      </div>
    </div>
  );
}

export function AdminLogin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const { setAdmin } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="auth-wrap">
      <div className="card" style={{ width: 420 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}><Logo to="/admin" size="lg" /></div>
        <h2>Admin Login</h2>
        {err && <div className="alert err">{err}</div>}
        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            const data = await api("/admin/auth/login", { method: "POST", body: form });
            localStorage.setItem("admin_token", data.token);
            setAdmin(data.admin);
            navigate("/admin/dashboard");
          } catch (ex) { setErr(ex.message); }
        }}>
          <div className="field"><label>Username</label><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
          <div className="field" style={{ marginTop: 10 }}><label>Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          <button className="btn btn-gold full" style={{ marginTop: 16 }}>Login</button>
        </form>
      </div>
    </div>
  );
}
