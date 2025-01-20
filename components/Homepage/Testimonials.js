import React from "react";
import { Box, Text, Avatar, Flex } from "@chakra-ui/react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Testimonials = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  const testimonialsData = [
    {
      text: "AI Models is consistently three weeks ahead of Twitter. Since subscribing I've been able to mute all the AI influencers and am better informed than ever.",
      name: "Philip P.",
      role: "AI Founder",
      avatar:
        "https://media.licdn.com/dms/image/C5603AQFhkTZjZxF6cQ/profile-displayphoto-shrink_100_100/0/1627310111771?e=1727308800&v=beta&t=4XvMSyMAxkjKaoljd7A0jkVYM6j2NSWdCWCtzUVwOqg",
    },
    {
      text: "The most comprehensive and meaningful index of AI models that are both emerging and production-ready so I can focus on building without getting left behind.",
      name: "Andy M.",
      role: "Founder, Safemail AI",
      avatar:
        "https://pbs.twimg.com/profile_images/1967113482/Ink-meNEWa_400x400.png",
    },
    {
      text: "It makes it easier for us that don't have the time or ideas to dig deep learn this amazingly fast-paced field, and for that we thank you.",
      name: "The AC guys",
      role: "Anon.",
      avatar:
        "https://substackcdn.com/image/fetch/w_88,h_88,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack.com%2Fimg%2Favatars%2Fyellow.png",
    },
    {
      text: "So many A.I. Newsletters focus on the big-ticket industry news items (e.g. the latest model releases, or which company bought a different company, etc.) But as an actual practitioner and educator in A.I. and NLP, I need a way to keep up to date on the latest research... you do just that!",
      name: "Christian Monson",
      role: "Tutor and mentor, A.I., Machine Learning, and NLP",
      avatar:
        "https://media.licdn.com/dms/image/C5603AQFAiqtIGY2xnw/profile-displayphoto-shrink_200_200/0/1572043262163?e=1727308800&v=beta&t=OBvwxjJJiUomhm9VzeshifLT09_L8Qw7zgYOIoyj8_w",
    },
    {
      text: "I was looking for a place where I can learn more about AI models without having to go through the twitter-sphere to learn more about new AI models that are coming out and came across your website. I really enjoyed your website and I decided to join the discord!",
      name: "Joel Mushagasha",
      role: "Computational Biochemist, Biomedical Engineering, AI Engineer",
      avatar:
        "https://media.licdn.com/dms/image/v2/D4E03AQEHkLNO_kuAqQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1696342959561?e=1729728000&v=beta&t=LDs78TGO_SjnQNwnFPN5IsYhqEe3NBu5QU6eFBbbV0Q",
    },
    {
      text: "The bite-sized recaps are very helpful! The current summary length is perfect.",
      name: "Joe",
      role: "AI & DAO",
      avatar:
        "https://pbs.twimg.com/profile_images/1497682972429877249/huKZ_1vH_400x400.png",
    },
    {
      text: "Solid weekly updates about AI models on Replicate.",
      name: "Daniel Nest",
      role: "Founder, Why Try AI",
      avatar:
        "https://pbs.twimg.com/profile_images/1646049735575207937/8uKnd3QL_400x400.jpg",
    },
  ];

  return (
    <Box maxWidth="400px" margin="0 auto">
      <Slider {...settings}>
        {testimonialsData.map((testimonial, index) => (
          <Box key={index} p={2}>
            <Flex
              direction="column"
              alignItems="center"
              bg="white"
              borderRadius="md"
              boxShadow="md"
              p={6}
              justifyContent="space-between"
            >
              <Text fontSize="md" textAlign="center" mb={4} color="gray.600">
                &ldquo;{testimonial.text}&rdquo;
              </Text>
              <Flex alignItems="center" justifyContent="center" width="100%">
                <Avatar
                  size="sm"
                  name={testimonial.name}
                  src={testimonial.avatar}
                  mr={3}
                />
                <Box textAlign="left">
                  <Text fontWeight="bold" fontSize="sm">
                    {testimonial.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {testimonial.role}
                  </Text>
                </Box>
              </Flex>
            </Flex>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default Testimonials;
