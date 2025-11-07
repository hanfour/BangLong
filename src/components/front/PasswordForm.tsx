import { FormEvent } from 'react';

interface PasswordFormProps {
  password: string;
  setPassword: (password: string) => void;
  onSubmit: (e: FormEvent) => void;
  error: string | null;
  isLoading?: boolean;
}

export default function PasswordForm({
  password,
  setPassword,
  onSubmit,
  error,
  isLoading = false,
}: PasswordFormProps) {
  return (
    <div className="bg-amber-50 border-2 border-amber-200 p-6 md:p-8">
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="password"
            className="block text-sm md:text-base font-medium text-gray-700 mb-3"
          >
            🔒 請輸入密碼以查看手冊內容
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-all"
            placeholder="請輸入 6-8 位密碼"
            required
            disabled={isLoading}
            minLength={6}
            maxLength={8}
          />
          <p className="text-xs text-gray-500 mt-2">
            密碼長度為 6-8 位，請向業務人員索取
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3">
            <p className="font-medium">❌ {error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-amber-800 text-white py-3 px-6 hover:bg-amber-900 active:bg-amber-950 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? '驗證中...' : '✓ 驗證並進入'}
        </button>
      </form>
    </div>
  );
}
