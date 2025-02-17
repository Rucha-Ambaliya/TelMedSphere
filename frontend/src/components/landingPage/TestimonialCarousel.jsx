import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import httpClient from "../../httpClient";
import patientMale from "../../assets/patient-male.png";

const TestimonialSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await httpClient.get("/website_feedback");
        let data = response.data;

        if (!data.length) {
          throw new Error("Testimonials not available");
        }

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received from API");
        }

        const sortedData = data.sort((a, b) => b.rating - a.rating);
        setTestimonials([...sortedData]);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setTestimonials([
          {
            username: "Sophia White",
            type: "Assistant Backend Developer",
            comments:
              "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatu",
            rating: 4,
            feedbackid: 1,
          },
          {
            username: "Scarlett Brown",
            type: "Chief Executive Officer",
            comments:
              "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, to",
            rating: 5,
            feedbackid: 2,
          },
          {
            username: "Jacob Moore",
            type: "Senior Developer",
            comments:
              "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur ma",
            rating: 4,
            feedbackid: 3,
          },
        ]);
      }
    };

    fetchTestimonials();
    const interval = setInterval(fetchTestimonials, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;

    const slideInterval = setInterval(() => {
      setPosition((prev) => {
        const next = prev - 0.2;
        const resetThreshold = -(testimonials.length / 4) * 100; // Half the list

        if (next <= resetThreshold) {
          return 0; // Seamless reset
        }

        return next;
      });
    }, 50);

    return () => clearInterval(slideInterval);
  }, [testimonials]);

  if (testimonials.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-300"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="text-center mb-20">
        <h3 className="text-orange-400 font-normal mb-3 text-lg tracking-wide">
          Testimonials
        </h3>
        <h2 className="text-[2.75rem] font-semibold text-gray-700 tracking-tight">
          Our Clients Review
        </h2>
      </div>

      <div className="relative overflow-hidden px-4">
        <div
          className={`flex justify-${
            testimonials.length <= 3 ? "center" : "start"
          } gap-8 transition-transform ${
            position === 0 ? "" : "duration-200 ease-linear"
          }`}
          style={{ transform: `translateX(${position}%)` }}
        >
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <div
              key={index}
              className="w-full md:w-1/3 flex-shrink-0 max-w-[440px] bg-[#f5f5f3] m-4 hover:scale-[1.05] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
            >
              <div className="relative pt-12">
                <div className="absolute left-1/2 -translate-x-1/2 -top-1 z-10">
                  <div className="w-20 h-20 mt-2 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                    <img
                      src={testimonial.profile_picture || patientMale}
                      alt="user profile picture"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="bg-[#faf2f1] rounded-2xl p-8 pt-12 relative">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                      {testimonial.username
                        ? testimonial.username
                        : "Anonymous"}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                      {testimonial.feedback_type}
                    </p>
                    <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                      {testimonial.comments}
                    </p>

                    <div className="flex justify-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={
                            i < testimonial.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialSection;
