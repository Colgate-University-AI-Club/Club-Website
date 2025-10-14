export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">About Colgate AI Club</h1>
        <p className="text-xl text-gray-600">
          We are a community of students passionate about artificial intelligence and machine learning.
        </p>
      </div>

      <div className="prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-4">
            The Colgate AI Club aims to democratize artificial intelligence education and foster a collaborative
            learning environment where students can explore, experiment, and innovate with AI technologies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Workshops & Learning</h3>
              <p className="text-gray-600">
                Regular workshops covering machine learning fundamentals, deep learning, computer vision, NLP, and more.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Collaboration</h3>
              <p className="text-gray-600">
                Work on exciting AI projects with fellow students, from beginner-friendly tutorials to advanced research.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Industry Connections</h3>
              <p className="text-gray-600">
                Connect with AI professionals, attend guest lectures, and discover internship and career opportunities.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Research Support</h3>
              <p className="text-gray-600">
                Support for student research projects and connections with faculty working in AI-related fields.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Join Us</h2>
          <p className="text-gray-600 mb-4">
            Whether you&apos;re a complete beginner or have experience with AI/ML, everyone is welcome!
            No prerequisites required – just curiosity and enthusiasm for learning.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>Meeting times and locations will be announced at the beginning of each semester.</strong>
              <br />
              Follow our events page and join our mailing list to stay updated!
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
          <p className="text-gray-600">
            Have questions or want to get involved? Reach out to us through our events or contribute page,
            and we&apos;ll get back to you soon.
          </p>
        </section>
      </div>
    </div>
  )
}
