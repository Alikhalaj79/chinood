export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-white to-[#f0f9f0] border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* آدرس */}
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-[#253614] mb-4">آدرس</h3>
            <p className="text-gray-700 leading-relaxed">
              کرج ، جهانشهر ، بلوار مولانا ، کوچه علی رحیمی شرقی ، پلاک 3
            </p>
          </div>

          {/* تماس */}
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-[#253614] mb-4">
              تماس با ما
            </h3>
            <div className="flex flex-col gap-2">
              <a
                href="tel:02166879630"
                className="text-gray-700 hover:text-[#497321] transition-colors"
              >
                021-66879630
              </a>
              <a
                href="tel:09126960132"
                className="text-gray-700 hover:text-[#497321] transition-colors"
              >
                09126960132
              </a>
              <a
                href="tel:09120533882"
                className="text-gray-700 hover:text-[#497321] transition-colors"
              >
                09120533882
              </a>
            </div>
          </div>

          {/* شبکه‌های اجتماعی */}
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-[#253614] mb-4">
              شبکه‌های اجتماعی
            </h3>
            <a
              href="https://instagram.com/chinoodd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-[#497321] transition-colors"
            >
              اینستاگرام: chinoodd
            </a>
          </div>

          {/* لینک‌های مفید */}
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-[#253614] mb-4">
              لینک‌های مفید
            </h3>
            <a
              href="https://www.sayehsazanco.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-[#497321] transition-colors"
            >
              sayehsazanco.com
            </a>
          </div>
        </div>

        {/* خط جداکننده و کپی رایت */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} تمامی حقوق برای پردیس گستران چینود محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
}

