import { useEffect, useState } from 'react'

function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter')

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase('exit')
    }, 1700)

    const timer2 = setTimeout(() => {
      if (onComplete) {
        onComplete()
      }
    }, 2250)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [onComplete])

  return (
    <div className={`splash-screen ${phase}`}>
      <style>{`
        .splash-screen {
          position: fixed;
          inset: 0;
          z-index: 99999;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(
              circle at 20% 20%,
              rgba(255, 227, 92, 0.45),
              transparent 28%
            ),
            radial-gradient(
              circle at 80% 75%,
              rgba(255, 139, 76, 0.28),
              transparent 30%
            ),
            #f7fff7;
          transition:
            opacity 0.55s ease,
            transform 0.55s ease;
        }

        .splash-screen.exit {
          opacity: 0;
          transform: scale(1.04);
          pointer-events: none;
        }

        .splash-content {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .logo-wrapper {
          position: relative;
          width: 118px;
          height: 118px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: logoEnter 0.8s cubic-bezier(.2,.8,.2,1) both;
        }

        .logo-glow {
          position: absolute;
          width: 118px;
          height: 118px;
          border-radius: 34px;
          background: rgba(12, 131, 31, 0.14);
          filter: blur(10px);
          animation: glowPulse 1.3s ease-in-out infinite;
        }

        .logo-box {
          position: relative;
          width: 92px;
          height: 92px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 27px;
          background: #0c831f;
          box-shadow:
            0 18px 35px rgba(12, 131, 31, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          transform: rotate(-4deg);
        }

        .logo-letter {
          color: #ffffff;
          font-size: 52px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -4px;
          transform: rotate(4deg);
          font-family: Arial, Helvetica, sans-serif;
        }

        .logo-shine {
          position: absolute;
          top: -20px;
          left: -50px;
          width: 35px;
          height: 140px;
          background: rgba(255, 255, 255, 0.4);
          transform: rotate(25deg);
          filter: blur(5px);
          animation: shine 1.5s ease 0.45s both;
        }

        .brand-name {
          margin-top: 24px;
          color: #0c831f;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 42px;
          font-weight: 900;
          letter-spacing: -2.5px;
          animation: brandEnter 0.7s ease 0.35s both;
        }

        .tagline {
          margin-top: 7px;
          color: #666666;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.5px;
          animation: taglineEnter 0.7s ease 0.55s both;
        }

        .loading-line {
          width: 145px;
          height: 4px;
          margin-top: 26px;
          overflow: hidden;
          border-radius: 100px;
          background: rgba(12, 131, 31, 0.12);
          animation: taglineEnter 0.7s ease 0.65s both;
        }

        .loading-progress {
          width: 45%;
          height: 100%;
          border-radius: inherit;
          background: #0c831f;
          animation: loadingProgress 1.45s ease-in-out both;
        }

        .floating-item {
          position: absolute;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.82);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.07);
          backdrop-filter: blur(8px);
          font-size: 27px;
          animation: float 3.5s ease-in-out infinite;
        }

        .item-one {
          top: 19%;
          left: 16%;
          animation-delay: 0s;
        }

        .item-two {
          top: 25%;
          right: 15%;
          animation-delay: 0.7s;
        }

        .item-three {
          bottom: 21%;
          left: 19%;
          animation-delay: 1.1s;
        }

        .item-four {
          bottom: 17%;
          right: 18%;
          animation-delay: 0.35s;
        }

        .dot {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .dot-one {
          width: 10px;
          height: 10px;
          top: 16%;
          left: 35%;
          background: #ffd84d;
          animation: dotFloat 3s ease-in-out infinite;
        }

        .dot-two {
          width: 14px;
          height: 14px;
          bottom: 18%;
          right: 36%;
          background: #ff8b4c;
          animation: dotFloat 3.5s ease-in-out infinite reverse;
        }

        .dot-three {
          width: 8px;
          height: 8px;
          top: 35%;
          right: 29%;
          background: #8d6bea;
          animation: dotFloat 2.8s ease-in-out infinite;
        }

        @keyframes logoEnter {
          0% {
            opacity: 0;
            transform: scale(0.45) rotate(-18deg);
          }

          60% {
            opacity: 1;
            transform: scale(1.08) rotate(2deg);
          }

          100% {
            opacity: 1;
            transform: scale(1) rotate(-4deg);
          }
        }

        @keyframes brandEnter {
          from {
            opacity: 0;
            transform: translateY(16px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes taglineEnter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes glowPulse {
          0%,
          100% {
            transform: scale(0.92);
            opacity: 0.55;
          }

          50% {
            transform: scale(1.08);
            opacity: 0.95;
          }
        }

        @keyframes shine {
          from {
            transform: translateX(-80px) rotate(25deg);
          }

          to {
            transform: translateX(260px) rotate(25deg);
          }
        }

        @keyframes loadingProgress {
          from {
            width: 0%;
          }

          to {
            width: 100%;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-14px) rotate(4deg);
          }
        }

        @keyframes dotFloat {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
          }

          50% {
            transform: translateY(-18px) scale(1.2);
            opacity: 1;
          }
        }

        @media (max-width: 600px) {
          .logo-wrapper {
            width: 105px;
            height: 105px;
          }

          .logo-glow {
            width: 105px;
            height: 105px;
          }

          .logo-box {
            width: 82px;
            height: 82px;
            border-radius: 24px;
          }

          .logo-letter {
            font-size: 46px;
          }

          .brand-name {
            font-size: 36px;
          }

          .floating-item {
            width: 46px;
            height: 46px;
            border-radius: 15px;
            font-size: 23px;
          }

          .item-one {
            left: 8%;
          }

          .item-two {
            right: 8%;
          }

          .item-three {
            left: 10%;
          }

          .item-four {
            right: 10%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .splash-screen,
          .logo-wrapper,
          .logo-glow,
          .logo-shine,
          .brand-name,
          .tagline,
          .loading-line,
          .floating-item,
          .dot {
            animation: none !important;
          }

          .loading-progress {
            width: 100%;
          }
        }
      `}</style>

      <div className="floating-item item-one">🥦</div>
      <div className="floating-item item-two">🥛</div>
      <div className="floating-item item-three">🍎</div>
      <div className="floating-item item-four">🛒</div>

      <span className="dot dot-one" />
      <span className="dot dot-two" />
      <span className="dot dot-three" />

      <div className="splash-content">
        <div className="logo-wrapper">
          <div className="logo-glow" />

          <div className="logo-box">
            <span className="logo-letter">B</span>
            <span className="logo-shine" />
          </div>
        </div>

        <div className="brand-name">blinkit</div>

        <div className="tagline">
          Everyday essentials, delivered fast.
        </div>

        <div className="loading-line">
          <div className="loading-progress" />
        </div>
      </div>
    </div>
  )
}

export default SplashScreen