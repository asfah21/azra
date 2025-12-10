import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function updateJabatan() {
  try {
    // Mapping jabatan berdasarkan array fid (Updated)
    const jabatanMapping = {
      'Accounting Site': [61],
      'Act. Foreman Fuel': [80],
      'Act. Foreman Mekanik': [120, 117],
      'Act. Foreman Operation (Rental)': [210],
      'Act. Jr Planner': [179],
      'Act. SPV Scm': [69],
      'Act. Supt.HRGA': [5],
      'Admin EDP': [188],
      'Admin Fuel': [83],
      'Admin Ga': [55],
      'Admin Hr': [9, 8],
      'Admin Hse': [64],
      'Admin Logistik': [72],
      'Admin Lubricant': [73],
      'Admin Plant': [181],
      'Admin Plant (Tyreman)': [182],
      'Admin Scm': [71],
      'Admin Trainer': [58],
      'Articulated Dump Truck': [219, 215, 217, 216, 218, 214, 221, 220],
      'Asst Trainer': [57],
      'Asst. Survey': [194],
      'Checker': [597, 600, 596, 595],
      'Cr Spesialis': [137, 136],
      'Crew Ga': [50, 51, 52, 49],
      'Crew Sampler': [612, 606, 610, 608, 599, 598, 603, 602, 611, 609, 607, 604, 605, 601, 618, 619, 617, 615, 616, 614, 613, 590, 591, 589],
      'Crew Survey': [197, 196, 195, 34, 198],
      'Dispatcher': [192, 191, 624],
      'Driver Dump Truck': [440, 439, 434, 433, 436, 432, 429, 428, 427, 453, 426, 451, 422, 448, 450, 420, 419, 417, 406, 444, 443, 409, 442, 402, 386, 401, 384, 399, 383, 396, 397, 382, 381, 378, 375, 395, 394, 373, 393, 391, 454, 449, 408, 407, 405, 404, 441, 403, 398, 392, 438, 390, 388, 435, 430, 385, 425, 423, 380, 421, 424, 379, 377, 376, 418, 374, 416, 415, 372, 414, 371, 413, 412, 211, 387, 400, 389, 588, 587, 580, 582, 584, 586, 585, 581, 583, 579, 578, 577, 576, 575, 571, 561, 560, 556, 572, 554, 562, 573, 564, 548, 567, 551, 569, 570, 555, 547, 574, 565, 568, 566, 563, 558, 557, 553, 559, 552, 549, 550],
      'Driver Dump Truck (Spare)': [544, 541, 545, 539, 534, 537, 535, 536, 533, 532, 530, 526, 527, 521, 525, 519, 517, 515, 512, 511, 516, 507, 503, 510, 506, 500, 497, 496, 494, 493, 492, 491, 490, 487, 484, 505, 504, 474, 476, 477, 479, 472, 471, 470, 469, 468, 431, 460, 461, 462, 465, 459, 456, 455, 452, 446, 445, 543, 542, 546, 540, 529, 528, 538, 531, 522, 524, 523, 520, 518, 514, 509, 501, 502, 508, 499, 513, 498, 464, 463, 495, 457, 458, 485, 486, 483, 481, 482, 480, 478, 475, 489, 473, 488, 447, 467, 466, 437, 410, 411, 212],
      'Driver Fueltruck': [87, 86, 85, 84],
      'Driver Lv': [33, 32, 31, 621, 620, 14],
      'Driver Manhaul': [48, 47, 46, 45, 43, 44, 42, 38, 36, 39, 35, 41, 37, 40],
      'Driver Water Truck': [594, 593, 592],
      'Edp': [187, 186, 185],
      'Eksternal Relation': [10],
      'Finance Officer': [60],
      'Foreman FOG': [79],
      'Foreman Fuel': [81],
      'Foreman Hr': [11],
      'Foreman Mekanik': [96],
      'Foreman Operation': [205, 204, 209, 203, 207, 208, 206, 200, 202],
      'Foreman Pam': [98],
      'Foreman Trainer': [56],
      'Foreman Tyreman': [164],
      'Fuel Controler': [82],
      'Fuelman': [92, 93, 90, 91, 88, 89, 94],
      'Ga': [15],
      'Ga Foreman': [12],
      'Ga Transport': [13],
      'General Mekanik': [123, 122, 121, 119, 118, 112, 110, 111, 109, 107, 113, 106],
      'General Support': [30],
      'Helper Mekanik': [157, 156, 155, 154, 153, 147, 150, 149, 148, 152, 146, 145, 144, 151],
      'Hr Officer': [54],
      'Hr Recruitment Officer': [7],
      'Hseqt Officer': [63],
      'Hydraulic Electrical Technician': [135],
      'Inspector': [99, 100],
      'Inventory Control': [70],
      'It Support': [16],
      'Jr. Mpe': [190],
      'Ka.Unit': [199],
      'Loundry Office': [29, 28],
      'Maintenance Planner': [180],
      'Manager Site': [3],
      'Mekanik': [124, 104, 105, 101, 700, 132, 131, 133, 134, 129, 130, 128, 126, 125, 127],
      'Mekanik Elektrik': [115, 114, 102],
      'Mekanik T2': [103],
      'Mekanik T3': [143, 142, 141, 140, 139, 138, 108, 116],
      'Mpe': [189],
      'Operation Officer': [213],
      'Operator ADT': [224, 223, 222],
      'Operator Crane Truck': [166],
      'Operator Dozer': [230, 229, 236, 227, 234, 233, 228, 237, 231, 225, 226, 235, 232],
      'Operator Excavator': [367, 370, 369, 368, 366, 365, 364, 265],
      'Operator Excavator (Breaker)': [276],
      'Operator Excavator 20': [333, 332, 330, 331, 329, 328, 326, 327, 325, 324, 323, 322, 320, 321, 319, 318, 314, 315, 317, 316, 309, 310, 311, 308, 307, 306, 304, 287, 285, 303, 284, 301, 300, 273, 271, 267, 268, 261, 313, 288, 289, 290],
      'Operator Excavator 20 (Breaker)': [305],
      'Operator Excavator 20 (Spare)': [357, 358, 352, 351, 347, 346, 342, 340, 362, 361, 360, 359, 356, 354, 353, 349, 348, 345, 344, 341, 343, 338, 339, 337, 336, 335, 334],
      'Operator Excavator 20 Breaker': [350],
      'Operator Excavator 30': [625, 312, 293, 291, 292, 286, 302, 282, 279, 277, 275, 274, 296, 272, 270, 269, 266, 263, 264, 262, 283, 281, 280, 299, 278, 298, 297, 295, 294],
      'Operator Excavator 50': [258, 259, 260],
      'Operator Excavator Breaker': [355, 363],
      'Operator Grader': [257, 252, 251, 250, 249],
      'Operator Grader Spare': [253, 256, 255, 254],
      'Operator Vibro': [245, 246, 247, 248, 244, 243, 242, 241, 240, 239, 238],
      'Paramedic': [68, 623],
      'Personal Assistant': [4],
      'Safety Patrol': [67, 66, 65],
      'Spv Hseqt Act': [62],
      'Spv Plant & Maintenance': [97],
      'Spv Trainer': [2],
      'Spv. Accounting Project': [59],
      'Spv. Operation Mining': [201],
      'Sr. SPV Plant & Maintenance': [95],
      'Stocker/Juru Masak': [27, 26, 25, 22, 23, 24, 18, 19, 21, 20, 17],
      'Supt. Mine Operation': [183],
      'Supt. Operation Rental': [184],
      'Surveyor': [193],
      'Toolkeeper': [178],
      'Trackman': [176, 177, 175],
      'Trainer Mekanik': [622],
      'Tryreman': [174],
      'Tyreman': [172, 171, 170, 169, 168, 165, 167, 173],
      'Tyre Engineer': [163],
      'Wakar': [6, 53],
      'Welder': [162, 161, 160, 158, 159],
      'Werehose': [78, 77, 76, 75, 74]
    };

    let totalUpdated = 0;
    const jabatanList = Object.keys(jabatanMapping).sort();

    console.log(`\n📊 Starting update for ${jabatanList.length} job positions...`);
    console.log('─'.repeat(60));

    // Loop setiap jabatan dan update user berdasarkan fid
    for (const jabatan of jabatanList) {
      const fidArray = jabatanMapping[jabatan];
      
      const result = await prisma.user.updateMany({
        where: {
          fid: {
            in: fidArray
          }
        },
        data: {
          jabatan: jabatan
        }
      });
      
      if (result.count > 0) {
        console.log(`✓ ${jabatan.padEnd(35)} → ${result.count.toString().padStart(3)} users`);
        totalUpdated += result.count;
      } else {
        console.log(`⚠ ${jabatan.padEnd(35)} → 0 users (no match)`);
      }
    }

    console.log('─'.repeat(60));
    console.log(`\n🎉 Total ${totalUpdated} user berhasil diupdate jabatannya!`);
    console.log(`📋 ${jabatanList.length} job positions processed\n`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('\nStack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateJabatan();