import {
  faAngleDown,
  faAngleUp,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import panzoom from "panzoom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useMapStore } from "@/store/mapStore";
import { width } from "@fortawesome/free-solid-svg-icons/fa0";

const MarzipanoPage = () => {
  const panoRef = useRef(null);
  const [showModal, setShowModal] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(true);
  const [selected, setSelected] = useState("");

  const scenesRef = useRef([]);

  const toggleDropdown = () => setOpenDropdown(!openDropdown);

  // Zustand

  const floors = useMapStore((state) => state.floors);
  const floorById = useMapStore((state) => state.floorById);
  const floorId = useMapStore((state) => state.floorId);

  const fetchGetAllFloorsWithRooms = useMapStore(
    (state) => state.fetchGetAllFloorsWithRooms,
  );
  const fetchGetFloorsWithRoomById = useMapStore(
    (state) => state.fetchGetFloorsWithRoomById,
  );
  const setFloorId = useMapStore((state) => state.setFloorId);

  const ruanganSet = async (id: number) => {
    setFloorId(id);
  };

  useEffect(() => {
    fetchGetAllFloorsWithRooms();
    fetchGetFloorsWithRoomById(Number(floorId));
  }, [floorId]);

  const denah = `http://localhost:8080${floorById?.floor_plan}`;

  const containerRef = useRef(null);
  const imgWrapperRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;

    if (!imgWrapperRef.current || !isMobile) return;

    const pan = panzoom(imgWrapperRef.current, {
      maxZoom: 4,
      minZoom: 1,
      bounds: true,
      boundsPadding: 0,
    });

    return () => pan.dispose();
  }, [denah, floorId]);

  const handleSwitchScene = (sceneId, loc) => {
    const findScene = scenesRef.current.find(
      (s) => String(s.id) === String(sceneId),
    );
    if (!findScene) return;

    setSelected(loc);
    findScene.scene.switchTo();
    setShowModal(false);
  };

  const Allfloors = floors;

  const floorRoom = floorById?.rooms.map((item, index) => ({
    ...item,
    sceneId: item.id,
  }));

  const viewerRef = useRef(null);

  useEffect(() => {
    import("marzipano").then((m) => {
      const MarzipanoLib = m.default;

      const viewer = new MarzipanoLib.Viewer(panoRef.current);
      viewerRef.current = viewer;

      const dynamicScenes = [];

      Allfloors?.forEach((floor) => {
        floor.rooms.forEach((room) => {
          if (!room.image) return; // skip kosong

          const id = room.id;

          const source = MarzipanoLib.ImageUrlSource.fromString(
            `http://localhost:8080${room.image}`,
          );
          const geometry = new MarzipanoLib.EquirectGeometry([{ width: 4096 }]);
          const limiter = MarzipanoLib.RectilinearView.limit.traditional(
            4096,
            (100 * Math.PI) / 180,
          );
          const view = new MarzipanoLib.RectilinearView({}, limiter);

          const scene = viewer.createScene({ source, geometry, view });

          const hotspotList = room.hotspot_information || [];

          hotspotList?.forEach((spot) => {
            const wrapper = document.createElement("div");
            wrapper.className = "relative";

            const icon = document.createElement("div");
            icon.className =
              "w-10 h-10 bg-blue-600 text-white text-sm flex items-center justify-center rounded-full cursor-pointer shadow-lg";
            icon.innerText = "i";

            const tooltip = document.createElement("div");
            tooltip.className =
              "absolute left-8 top-1 bg-white text-black p-2 rounded-lg shadow-xl text-xs w-[150px] border border-gray-300 z-50 opacity-0 pointer-events-none transition-opacity duration-200";
            tooltip.innerHTML = `<b>${spot.label}</b><br>${spot.description}`;

            wrapper.addEventListener("mouseenter", () => {
              tooltip.style.opacity = "1";
            });

            wrapper.addEventListener("mouseleave", () => {
              tooltip.style.opacity = "0";
            });

            wrapper.appendChild(icon);
            wrapper.appendChild(tooltip);

            scene.hotspotContainer().createHotspot(wrapper, {
              yaw: spot.yaw,
              pitch: spot.pitch,
            });
          });

          const navList = room.hotspot_navigation || [];

          navList.forEach((nav) => {
            const wrapper = document.createElement("div");
            wrapper.className = "relative group";

            const targetId = nav.target_room_id;
            const targetLoc = nav.target_room_label;

            const icon = document.createElement("div");
            icon.className =
              "w-10 h-10 bg-orange-600 text-white flex items-center justify-center rounded-full cursor-pointer";
            icon.innerText = "⮝";

            const tooltip = document.createElement("div");
            tooltip.className =
              "absolute -top-10 left-1/2 -translate-x-1/2 bg-orange-300 border border-orange-500 text-white text-xs px-2.5 py-1.5 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 scale-95 group-hover:scale-100 whitespace-nowrap pointer-events-none font-semibold";

            tooltip.innerText = targetLoc;

            icon.addEventListener("click", () => {
              handleSwitchScene(targetId, targetLoc);
            });

            wrapper.appendChild(icon);
            wrapper.appendChild(tooltip);

            scene.hotspotContainer().createHotspot(wrapper, {
              yaw: nav.yaw,
              pitch: nav.pitch,
            });
          });

          dynamicScenes.push({ id, scene });
        });
      });

      scenesRef.current = dynamicScenes;

      dynamicScenes[0]?.scene.switchTo();
    });
  }, [Allfloors?.length]);

  return (
    <div>
      <div className="flex justify-center items-center h-screen">
        <div className={`relative w-screen h-screen`}>
          <div ref={panoRef} className={`w-full h-full marzipano-container `} />

          <div className="absolute top-5 left-5 gap-10 flex  justify-center flex-col">
            <button
              onClick={() => setShowModal(true)}
              className=" bg-blue-600 text-white w-26 py-2 rounded-lg shadow-lg cursor-pointer"
              style={{ zIndex: 10 }}
            >
              Pilih Lantai
            </button>

            <div className="relative w-[220px]">
              <div
                className="bg-white border border-gray-300 rounded-md py-2 px-3 flex justify-between items-center cursor-pointer shadow-sm hover:border-gray-400 transition duration-150"
                onClick={toggleDropdown}
              >
                <p className="text-sm font-medium text-gray-700">
                  {selected ? selected : "Choose a Room"}
                </p>

                <div className="text-gray-600">
                  {openDropdown ? (
                    <FontAwesomeIcon icon={faAngleUp} />
                  ) : (
                    <FontAwesomeIcon icon={faAngleDown} />
                  )}
                </div>
              </div>

              {openDropdown && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-60 overflow-auto animate-fadeIn">
                  {floorRoom?.map((item, index) => (
                    <div
                      key={index}
                      className="py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition"
                      onClick={() => handleSwitchScene(item.sceneId, item.name)}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {showModal && (
            <div className=" w-full h-full absolute top-0 bottom-0 z-50 flex items-center justify-center bg-black/50 ">
              <div
                className={`max-h-[90vh] w-7/8 lg:overflow-y-auto overflow-hidden rounded-xl bg-white p-2 text-sm`}
              >
                <div className=" flex items-center justify-between rounded-xl p-4 shadow-sm">
                  <h2 className="text-xl font-bold text-[#333333]">
                    Pilih Ruangan
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-xl font-semibold text-gray-500 hover:text-gray-700"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
                <div className="w-full flex-wrap xl:flex-nowrap flex gap-2 my-5 justify-center">
                  {Allfloors?.map((item: any) => (
                    <button
                      key={item?.id}
                      className={`w-1/3 bg-gray-400 hover:bg-gray-600 py-2 text-white rounded-lg cursor-pointer`}
                      onClick={() => ruanganSet(item.id)}
                    >
                      <p>{item?.name}</p>
                    </button>
                  ))}
                </div>

                <div className="relative hidden lg:block overflow-hidden">
                  <img src={denah} alt="denah" className="w-full " />

                  {floorRoom?.map((item, index) => (
                    <div
                      className=" absolute  lg:h-4 lg:w-4  flex items-center px-1  bg-red-500 hover:bg-red-200 rounded-full cursor-pointer "
                      style={{
                        left: `${item.pos_x}%`,
                        top: `${item.pos_y}%`,
                      }}
                      onClick={() => handleSwitchScene(item.sceneId, item.name)}
                    ></div>
                  ))}
                </div>

                <div
                  ref={containerRef}
                  className="relative  lg:hidden overflow-hidden border"
                  style={{ width: "100%", height: "100%" }}
                >
                  <div
                    ref={imgWrapperRef}
                    style={{ width: "fit-content", height: "fit-content" }}
                  >
                    <img
                      src={denah}
                      alt="denah"
                      className="pointer-events-none select-none"
                      draggable={false}
                      style={{ width: "100%", height: "auto" }}
                    />

                    {floorRoom?.map((item, index) => (
                      <div
                        key={index}
                        className="absolute lg:h-4 lg:w-4 w-2 h-2 bg-red-500 hover:bg-red-300 rounded-full cursor-pointer"
                        onClick={() =>
                          handleSwitchScene(item.sceneId, item.name)
                        }
                        style={{
                          left: `${item.pos_x}%`,
                          top: `${item.pos_y}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* <div>hello world</div> */}
    </div>
  );
};

export default MarzipanoPage;
