import type { FC } from 'react';

export const EventTerms: FC = () => {
  return (
    <div className="space-y-[24px]">
      <h2 className="font-semibold">Terms and Conditions of Sale</h2>
      <div className="space-y-2">
        <p className="text-gray-600">
          MySejahtera check-in is no longer mandatory - however we are required
          to check on individual health/risk status before admission, so please
          ensure to update your MySejahtera profile before entering the
          premises.
        </p>
        <p className="text-gray-600">
          In extremely rare circumstances, the management reserves the right to
          make any alterations to the advertised program or performing artist
          without being subject to any refund or exchange.
        </p>
      </div>
    </div>
  );
};
