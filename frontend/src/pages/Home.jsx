import React from 'react'
import Hero from '../components/Hero'
// import Companies from '../components/Companies'
import Features from '../components/Features'
import Properties from '../components/propertiesshow'
import Steps from '../components/Steps'
import Testimonials from '../components/testimonial'
import LatestBlogs from '../components/LatestBlogs'

const Home = () => {
  return (
    <div>
      <Hero />
      {/* <Companies /> */}
      <Properties />
      <Features />
      <Steps />
      <Testimonials />
      <LatestBlogs />
    </div>
  )
}

export default Home
