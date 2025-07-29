export default function WithLove() {
  return (
    <section className="px-6 md:px-20 relative gap-2 w-full flex flex-col items-center z-20 mt-16 lg:mt-44">
      <div className="max-w-4xl flex flex-col gap-8">
        <div>
          <div className="flex flex-col gap-2 justify-center w-full text-center items-center">
            <div className="flex md:inline-flex flex-col md:flex-row items-center">
              <h1 className="tracking-tight inline font-semibold text-3xl lg:text-5xl">
                Made with&nbsp;
              </h1>
              <svg
                aria-hidden="true"
                className="text-red-500 animate-heartbeat"
                fill="none"
                focusable="false"
                height="50"
                role="presentation"
                viewBox="0 0 24 24"
                width="50"
                // style="animation-duration:2.5s"
              >
                <path
                  d="M16.44 3.10156C14.63 3.10156 13.01 3.98156 12 5.33156C10.99 3.98156 9.37 3.10156 7.56 3.10156C4.49 3.10156 2 5.60156 2 8.69156C2 9.88156 2.19 10.9816 2.52 12.0016C4.1 17.0016 8.97 19.9916 11.38 20.8116C11.72 20.9316 12.28 20.9316 12.62 20.8116C15.03 19.9916 19.9 17.0016 21.48 12.0016C21.81 10.9816 22 9.88156 22 8.69156C22 5.60156 19.51 3.10156 16.44 3.10156Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>

          <p className="w-full my-2 text-medium lg:text-large font-normal text-default-500 max-w-full md:w-full text-center flex justify-center items-center">
            Crafted with precision and care by the IT Department to streamline
            asset management across operations.
          </p>
          <div />
        </div>
      </div>
    </section>
  );
}
