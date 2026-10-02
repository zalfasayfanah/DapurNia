import React from 'react';
import { Dialog } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { MapPinOff, HeartHandshake } from 'lucide-react';

interface OutsideComplexModalProps {
  open: boolean;
  onClose: () => void;
}

export function OutsideComplexModal({ open, onClose }: OutsideComplexModalProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Mohon Maaf, Di Luar Jangkauan">
      <div className="flex flex-col items-center text-center p-2 space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shadow-inner">
          <MapPinOff className="w-8 h-8" />
        </div>

        <p className="text-lg text-slate-700 leading-relaxed">
          Terima kasih atas minat Bapak/Ibu pada <strong>Dapur Nia</strong>. Mohon maaf sekali, saat ini Dapur Nia <strong>hanya dapat melayani pengantaran di dalam area Kompleks Griya Indah</strong> demi menjaga ketepatan waktu dan kualitas hidangan tetap hangat.
        </p>

        <p className="text-base text-slate-500">
          Kami berharap dapat segera memperluas jangkauan ke wilayah Bapak/Ibu di kesempatan mendatang!
        </p>

        <Button
          onClick={onClose}
          variant="primary"
          size="lg"
          className="w-full mt-2"
        >
          <HeartHandshake className="w-5 h-5 mr-2" />
          Saya Mengerti
        </Button>
      </div>
    </Dialog>
  );
}
