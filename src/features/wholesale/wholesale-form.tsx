import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { shopApi } from "@/features/shop/api/shop.api";
import { BackendError } from "@/shared/api/api-client";
import { Field } from "@/shared/ui/field";

/*
import { businessTypes, volumeOptions, BusinessType, VolumeKey } from '@/features/wholesale/data';
import { AppSelect } from '@/shared/ui/app-select';
*/

export function WholesaleForm() {
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    province: "",
    note: "",
    /* business: '', */
  });
  /*
  const [type, setType] = useState<BusinessType>('agency');
  const [volume, setVolume] = useState<VolumeKey>('lt20');
  */
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!values.name.trim() || !values.province.trim()) {
      return setError("Vui lòng điền đủ các trường bắt buộc.");
    }
    const cleanedPhone = values.phone.replace(/\s/g, "");
    if (!/^(0|\+?84)\d{9,10}$/.test(cleanedPhone)) {
      return setError(
        "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại di động Việt Nam.",
      );
    }
    if (
      values.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
    ) {
      return setError("Địa chỉ email không đúng định dạng.");
    }

    setSubmitting(true);
    setError("");

    try {
      await shopApi.submitPartnerContactRequest({
        fullName: values.name.trim(),
        phoneNumber: cleanedPhone,
        email: values.email.trim() || undefined,
        province: values.province.trim() || undefined,
        note: values.note.trim() || undefined,
      });
      setSent(true);
    } catch (err: unknown) {
      if (err instanceof BackendError) {
        if (err.status === 409) {
          setError(
            "Số điện thoại hoặc email này đã gửi yêu cầu trước đó. Chuyên viên Mevi sẽ sớm liên hệ lại với bạn.",
          );
        } else if (err.fieldErrors?.phoneNumber) {
          setError("Số điện thoại không đúng định dạng.");
        } else if (err.message) {
          setError(err.message);
        } else {
          setError("Không thể gửi yêu cầu hợp tác, vui lòng thử lại sau.");
        }
      } else {
        setError("Lỗi kết nối máy chủ, vui lòng thử lại sau.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div
        className="surface flex flex-col items-center justify-center p-8 text-center md:p-12"
        data-testid="wholesale-success"
      >
        <span className="grid h-14 w-14 place-items-center rounded-full bg-[#eef1e9] text-[#285e45]">
          <Check size={28} strokeWidth={2.5} />
        </span>
        <h3 className="mt-4 text-2xl font-extrabold text-[#214c3a]">
          Đã nhận thông tin của bạn!
        </h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Chuyên viên Mevi sẽ liên hệ{" "}
          <strong className="font-semibold text-[#214c3a]">
            {values.name}
          </strong>{" "}
          qua số{" "}
          <strong className="font-semibold text-[#214c3a]">
            {values.phone}
          </strong>{" "}
          trong vòng 24 giờ làm việc để tư vấn và trao đổi chi tiết.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="btn-primary inline-flex h-11 shrink-0 items-center justify-center px-6 text-sm font-bold leading-normal"
          >
            Xem sản phẩm
          </Link>
          <button
            type="button"
            className="btn-outline inline-flex h-11 shrink-0 items-center justify-center px-6 text-sm font-bold leading-normal"
            onClick={() => {
              setSent(false);
              setValues({
                name: "",
                phone: "",
                email: "",
                province: "",
                note: "",
              });
            }}
          >
            Gửi đăng ký khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="surface p-6 md:p-8"
      data-testid="form-wholesale"
    >
      <h3 className="text-2xl font-extrabold text-[#214c3a]">
        Đăng ký hợp tác
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Nhận báo giá sỉ và tư vấn trong 24 giờ.
      </p>

      <fieldset disabled={submitting} className="contents">
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Họ và tên" required>
            <input
              className="field"
              value={values.name}
              onChange={set("name")}
              placeholder="Nguyễn Văn A"
              disabled={submitting}
              data-testid="input-lead-name"
            />
          </Field>

          {/* Tạm comment ẩn theo yêu cầu: Backend chưa hỗ trợ trường tên cửa hàng/doanh nghiệp
          <Field label="Tên cửa hàng / doanh nghiệp" required>
            <input
              className="field"
              value={values.business}
              onChange={set('business')}
              placeholder="Cửa hàng Xanh"
              disabled={submitting}
              data-testid="input-lead-business"
            />
          </Field>
          */}

          <Field label="Số điện thoại" required>
            <input
              className="field"
              value={values.phone}
              onChange={set("phone")}
              inputMode="tel"
              placeholder="0901 234 567"
              disabled={submitting}
              data-testid="input-lead-phone"
            />
          </Field>

          <Field label="Email">
            <input
              className="field"
              type="email"
              value={values.email}
              onChange={set("email")}
              placeholder="ban@email.com"
              disabled={submitting}
            />
          </Field>

          {/* Tạm comment ẩn theo yêu cầu: Backend chưa hỗ trợ trường loại hình kinh doanh
          <Field label="Loại hình kinh doanh" required>
            <AppSelect<BusinessType>
              value={type}
              onChange={setType}
              options={[...businessTypes]}
              testId="select-lead-type"
            />
          </Field>
          */}

          <Field label="Tỉnh / thành phố" required>
            <input
              className="field"
              value={values.province}
              onChange={set("province")}
              placeholder="TP. Hồ Chí Minh"
              disabled={submitting}
              data-testid="input-lead-province"
            />
          </Field>

          {/* Tạm comment ẩn theo yêu cầu: Backend chưa hỗ trợ trường sản lượng dự kiến
          <Field label="Sản lượng dự kiến" required wide>
            <AppSelect<VolumeKey>
              value={volume}
              onChange={setVolume}
              options={[...volumeOptions]}
              testId="select-lead-volume"
            />
          </Field>
          */}

          <Field label="Nhu cầu sản phẩm / Ghi chú" wide>
            <textarea
              className="field min-h-24 resize-y"
              value={values.note}
              onChange={set("note")}
              disabled={submitting}
              placeholder="VD: Cần 50kg rau củ Đà Lạt mỗi tuần, cà phê rang cho quán..."
            />
          </Field>
        </div>

        {error && (
          <p className="mt-4 text-sm font-semibold text-[#a7473d]">{error}</p>
        )}

        <button
          type="submit"
          className="btn-primary mt-6 flex w-full items-center justify-center gap-2"
          disabled={submitting}
          data-testid="button-submit-lead"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Đang gửi yêu cầu...
            </>
          ) : (
            <>
              Gửi đăng ký <ArrowRight size={16} />
            </>
          )}
        </button>
      </fieldset>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Hoặc gọi hotline <b className="text-[#214c3a]">1900 6868</b> (8:00 –
        20:00)
      </p>
    </form>
  );
}
