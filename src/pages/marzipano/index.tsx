import {
  faMaximize,
  faMinimize,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { lantaiData } from "@/utils/floorData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";

const MarzipanoPage = () => {
  const panoRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [idRuangan, setIdRuangan] = useState(3);

  const scenesRef = useRef([]);

  const handleSwitchScene = (sceneId) => {
    const findScene = scenesRef.current.find((s) => s.id === sceneId);
    if (!findScene) return;

    findScene.scene.switchTo();
    setShowModal(false);
  };

  const findLantai = lantaiData[idRuangan].ruangan.map((item, index) => ({
    ...item,
    sceneId: `${idRuangan}-${index}`, // ← ID yang terhubung ke scene
  }));

  const viewerRef = useRef(null);

  useEffect(() => {
    import("marzipano").then((m) => {
      const MarzipanoLib = m.default;

      const viewer = new MarzipanoLib.Viewer(panoRef.current);
      viewerRef.current = viewer;

      const dynamicScenes = [];

      lantaiData.forEach((lantai, lantaiIndex) => {
        lantai.ruangan.forEach((ruangan, ruanganIndex) => {
          if (!ruangan.url) return; // skip kosong

          const id = `${lantaiIndex}-${ruanganIndex}`;

          const source = MarzipanoLib.ImageUrlSource.fromString(ruangan.url);
          const geometry = new MarzipanoLib.EquirectGeometry([{ width: 4096 }]);
          const limiter = MarzipanoLib.RectilinearView.limit.traditional(
            4096,
            (100 * Math.PI) / 180,
          );
          const view = new MarzipanoLib.RectilinearView({}, limiter);

          const scene = viewer.createScene({ source, geometry, view });

          const hotspotList = ruangan.hotspot || [];

          hotspotList.forEach((spot) => {
            const wrapper = document.createElement("div");
            wrapper.className = "relative";

            const icon = document.createElement("div");
            icon.className =
              "w-7 h-7 bg-blue-600 text-white text-sm flex items-center justify-center rounded-full cursor-pointer shadow-lg";
            icon.innerText = "i";

            const tooltip = document.createElement("div");
            tooltip.className =
              "hidden absolute left-8 top-1 bg-white text-black p-2 rounded-lg shadow-xl text-xs w-[150px] border border-gray-300 z-50";
            tooltip.innerHTML = `<b>${spot.label}</b><br>${spot.description}`;

            icon.addEventListener("click", () => {
              tooltip.classList.toggle("hidden");
            });

            wrapper.appendChild(icon);
            wrapper.appendChild(tooltip);

            scene.hotspotContainer().createHotspot(wrapper, {
              yaw: spot.yaw,
              pitch: spot.pitch,
            });
          });

          dynamicScenes.push({ id, scene });
        });
      });

      scenesRef.current = dynamicScenes;

      dynamicScenes[0]?.scene.switchTo();
    });
  }, [lantaiData]);

  useEffect(() => {
    if (!viewerRef.current) return;

    const viewer = viewerRef.current;

    setTimeout(() => {
      viewer.updateSize();

      scenesRef.current.forEach((s) => {
        try {
          s.scene.view().setParameters({});
        } catch (_) {}
      });
    }, 200);
  }, [fullScreen]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div
        className={`relative ${fullScreen ? "w-screen h-screen" : "xl:w-[60em] xl:h-[40em] h-[40em] w-[20em]    "}`}
      >
        <div
          ref={panoRef}
          className={`w-full h-full marzipano-container ${!fullScreen && "rounded-2xl"}`}
        />

        <div className="absolute top-5 left-5 flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className=" bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg cursor-pointer"
            style={{ zIndex: 10 }}
          >
            Pilih Lokasi
          </button>
          {fullScreen ? (
            <>
              <button
                onClick={() => setFullScreen(false)}
                className="  text-white rounded-lg text-lg bg-green-600 px-2  shadow-lg"
                style={{ zIndex: 10 }}
              >
                {" "}
                <FontAwesomeIcon icon={faMinimize} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setFullScreen(true)}
                className=" text-white rounded-lg text-lg bg-green-600 px-2  shadow-lg"
                style={{ zIndex: 10 }}
              >
                {" "}
                <FontAwesomeIcon icon={faMaximize} />
              </button>
            </>
          )}
        </div>

        {showModal && (
          <div className=" w-full h-full absolute top-0 bottom-0 z-50 flex items-center justify-center bg-black/50 rounded-2xl">
            <div
              className={`max-h-[90vh] ${fullScreen ? "w-2/4" : "w-3/4"} overflow-y-auto rounded-xl bg-white p-2 text-sm`}
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
                {lantaiData?.map((item: any) => (
                  <button
                    key={item?.id}
                    className={`w-1/3 bg-gray-400 hover:bg-gray-600 py-2 text-white rounded-lg cursor-pointer`}
                    onClick={() => setIdRuangan(item.id)}
                  >
                    <p>{item?.name}</p>
                  </button>
                ))}
              </div>

              <div className="w-full grid  xl:grid-cols-3 gap-2">
                {findLantai.map((item: any, index: number) => (
                  <p
                    key={index}
                    onClick={() => handleSwitchScene(item.sceneId)}
                    className="bg-blue-400 text-center py-2 text-white rounded-xl cursor-pointer hover:bg-blue-600"
                  >
                    {item.loc}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarzipanoPage;
