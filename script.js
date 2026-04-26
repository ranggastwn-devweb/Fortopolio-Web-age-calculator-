 const HARI_ID = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
      const BULAN_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

      // Auto-jump focus: day→month→year
      document.getElementById('inputDay').addEventListener('input', function() {
        if (this.value.length >= 2 || parseInt(this.value) > 3) {
          document.getElementById('inputMonth').focus();
        }
      });
      document.getElementById('inputMonth').addEventListener('input', function() {
        if (this.value.length >= 2 || parseInt(this.value) > 1) {
          document.getElementById('inputYear').focus();
        }
      });

      // Enter key
      ['inputDay','inputMonth','inputYear'].forEach(id => {
        document.getElementById(id).addEventListener('keydown', e => {
          if (e.key === 'Enter') calculate();
        });
      });

      function showError(msg, fields = []) {
        const el = document.getElementById('errorMsg');
        document.getElementById('errorText').textContent = msg;
        el.classList.add('show');
        ['inputDay','inputMonth','inputYear'].forEach(id => {
          document.getElementById(id).classList.remove('error-field');
        });
        fields.forEach(id => document.getElementById(id).classList.add('error-field'));
        setTimeout(() => {
          el.classList.remove('show');
          fields.forEach(id => document.getElementById(id).classList.remove('error-field'));
        }, 3500);
      }

      function animateCount(el, target, duration = 800) {
        const startTime = performance.now();
        el.classList.remove('counting');
        void el.offsetWidth;
        el.classList.add('counting');
        function step(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * ease);
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
      }

      function calculate() {
        document.getElementById('errorMsg').classList.remove('show');

        const day   = parseInt(document.getElementById('inputDay').value);
        const month = parseInt(document.getElementById('inputMonth').value);
        const year  = parseInt(document.getElementById('inputYear').value);

        // Validations
        if (!day || !month || !year) {
          const missing = [];
          if (!day)   missing.push('inputDay');
          if (!month) missing.push('inputMonth');
          if (!year)  missing.push('inputYear');
          showError('Silakan lengkapi semua kolom tanggal lahir.', missing);
          return;
        }
        if (month < 1 || month > 12) {
          showError('Bulan harus antara 1 – 12.', ['inputMonth']); return;
        }
        if (day < 1 || day > 31) {
          showError('Tanggal harus antara 1 – 31.', ['inputDay']); return;
        }
        if (year < 1900 || year > new Date().getFullYear()) {
          showError('Tahun tidak valid.', ['inputYear']); return;
        }

        // Build date (month is 0-indexed)
        const birthDate = new Date(year, month - 1, day);

        // Check if date is real (e.g. 31 Feb would shift)
        if (birthDate.getDate() !== day || birthDate.getMonth() !== month - 1) {
          showError('Tanggal tidak valid untuk bulan tersebut.', ['inputDay','inputMonth']); return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (birthDate > today) {
          showError('Tanggal lahir tidak boleh di masa depan.', ['inputDay','inputMonth','inputYear']); return;
        }

        // === Precise age calculation ===
        let years  = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth()    - birthDate.getMonth();
        let days   = today.getDate()     - birthDate.getDate();

        if (days < 0) {
          months--;
          const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
          days += prevMonth.getDate();
        }
        if (months < 0) { years--; months += 12; }

        const msPerDay    = 1000 * 60 * 60 * 24;
        const totalDays   = Math.floor((today - birthDate) / msPerDay);
        const totalMonths = years * 12 + months;

        let nextBD = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (nextBD <= today) nextBD.setFullYear(nextBD.getFullYear() + 1);
        const daysToNextBD = Math.round((nextBD - today) / msPerDay);
        const isBirthday = today.getDate() === birthDate.getDate() && today.getMonth() === birthDate.getMonth();

        const dayBornStr = HARI_ID[birthDate.getDay()] + ', ' + birthDate.getDate() + ' ' + BULAN_ID[birthDate.getMonth()] + ' ' + birthDate.getFullYear();

        const section = document.getElementById('resultSection');
        section.classList.remove('visible');
        void section.offsetWidth;
        section.classList.add('visible');

        setTimeout(() => animateCount(document.getElementById('numTahun'), years,  900), 100);
        setTimeout(() => animateCount(document.getElementById('numBulan'), months, 700), 200);
        setTimeout(() => animateCount(document.getElementById('numHari'),  days,   600), 300);

        setTimeout(() => {
          document.getElementById('totalDays').textContent    = totalDays.toLocaleString('id-ID') + ' hari';
          document.getElementById('totalMonths').textContent  = totalMonths.toLocaleString('id-ID') + ' bulan';
          document.getElementById('nextBirthday').textContent = isBirthday ? '🎂 Hari ini!' : daysToNextBD + ' hari lagi';
          document.getElementById('dayBorn').textContent      = dayBornStr;
          const alert = document.getElementById('birthdayAlert');
          isBirthday ? alert.classList.add('show') : alert.classList.remove('show');
        }, 600);
      }