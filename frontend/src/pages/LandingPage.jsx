import LandingNavbar from '../components/LandingNavbar'
import Footer from '../components/Footer'
import caregiverHero from '../assets/landing/caregiver-hero.png'
import searchIcon from '../assets/landing/search.svg'
import documentIcon from '../assets/landing/document.svg'
import heartIcon from '../assets/landing/heart.svg'

const steps = [
  {
    title: '1. ค้นหาและจับคู่',
    description: 'ระบบจะกรองผู้ดูแลที่มีทักษะตรงกับอาการของผู้ป่วย',
    icon: searchIcon,
    className: 'landing-step-search',
  },
  {
    title: '2. ตรวจสอบประวัติ',
    description: 'ผู้ดูแลทุกคนผ่านการยืนยันตัวตนและเอกสารวิชาชีพ',
    icon: documentIcon,
    className: 'landing-step-document',
  },
  {
    title: '3. เริ่มการดูแล',
    description: 'อุ่นใจกับบริการที่ได้มาตรฐาน พร้อมระบบรีวิวหลังจบงาน',
    icon: heartIcon,
    className: 'landing-step-heart',
  },
]

function LandingPage({ onLogin, onRegister }) {
  return (
    <div className="landing-page">
      <LandingNavbar onLogin={onLogin} onRegister={onRegister} />

      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <h1>หาผู้ดูแลที่ใช่ ด้วยความ<br />ใส่ใจที่เรามี</h1>
            <p>
              แพลตฟอร์มจับคู่ผู้ดูแลผู้ป่วยและผู้สูงอายุที่ผ่านการตรวจสอบประวัติ
              และใบรับรองวิชาชีพ เพื่อความอุ่นใจของครอบครัวคุณ
            </p>
            <div className="landing-hero-actions">
              <button type="button" className="landing-primary-button" onClick={onRegister}>
                ค้นหาผู้ดูแล (สำหรับผู้ว่าจ้าง)
              </button>
              <button type="button" className="landing-caregiver-button" onClick={onRegister}>
                สมัครเป็นผู้ดูแล
              </button>
            </div>
          </div>

          <div className="landing-hero-visual" aria-hidden="true">
            <span className="landing-glow landing-glow-green" />
            <span className="landing-glow landing-glow-blue" />
            <div className="landing-image-frame">
              <img src={caregiverHero} alt="ผู้ดูแลกำลังพูดคุยกับผู้สูงอายุ" />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-how-it-works" aria-labelledby="how-it-works-heading">
        <div className="landing-section-heading">
          <h2 id="how-it-works-heading">ทำงานอย่างไร?</h2>
          <span />
        </div>
        <div className="landing-step-list">
          {steps.map((step) => (
            <article className="landing-step-card" key={step.title}>
              <div className={`landing-step-icon ${step.className}`}>
                <img src={step.icon} alt="" />
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage
