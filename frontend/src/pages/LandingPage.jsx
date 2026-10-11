import LandingNavbar from '../components/LandingNavbar'
import Footer from '../components/Footer'
import caregiverHero from '../assets/landing/caregiver-hero.png'
import searchIcon from '../assets/landing/search.svg'
import documentIcon from '../assets/landing/document.svg'
import heartIcon from '../assets/landing/heart.svg'

const steps = [
  {
    title: '1. สร้างประกาศงาน',
    description:
      'ผู้ว่าจ้างเพิ่มผู้ป่วย ระบุวันเวลา ค่าตอบแทน และทักษะที่ต้องการ',
    icon: searchIcon,
    className: 'landing-step-search',
  },
  {
    title: '2. เลือกผู้ดูแล',
    description: 'ดูผู้ดูแลที่ยืนยันตัวตนแล้ว ส่งคำเชิญหรือพิจารณาใบสมัคร',
    icon: documentIcon,
    className: 'landing-step-document',
  },
  {
    title: '3. เริ่มการดูแล',
    description:
      'ผู้ดูแลตอบรับแล้วเปิดข้อมูลติดต่อ เริ่มงาน และยืนยันจบงานร่วมกัน',
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
            <h1>
              หาผู้ดูแลที่ใช่
              <br />
              ด้วยความใส่ใจ
            </h1>
            <p>
              สร้างประกาศ ค้นหาผู้ดูแลที่ทักษะตรงกับงาน
              และติดต่อกันหลังจับคู่สำเร็จ
              พร้อมขั้นตอนยืนยันตัวตนก่อนผู้ดูแลปรากฏในผลค้นหา
            </p>
            <div className="landing-hero-actions">
              <button
                type="button"
                className="landing-primary-button"
                onClick={onRegister}
              >
                ค้นหาผู้ดูแล (สำหรับผู้ว่าจ้าง)
              </button>
              <button
                type="button"
                className="landing-caregiver-button"
                onClick={onRegister}
              >
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

      <section
        className="landing-how-it-works"
        aria-labelledby="how-it-works-heading"
      >
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

      <section className="landing-caregiver-steps">
        <h2>สำหรับผู้ดูแล</h2>
        <p>
          สมัครและบันทึกโปรไฟล์ → เลือกทักษะ → ส่งเอกสารให้แอดมินตรวจ →
          เปิดพร้อมรับงาน → สมัครงานหรือตอบรับคำเชิญ
        </p>
        <button
          type="button"
          className="landing-caregiver-button"
          onClick={onRegister}
        >
          เริ่มสร้างโปรไฟล์ผู้ดูแล
        </button>
      </section>
      <Footer />
    </div>
  )
}

export default LandingPage
