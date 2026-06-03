using System;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using Microsoft.Web.WebView2.WinForms;
using Microsoft.AspNetCore.Builder;

namespace PimsApp
{
    public class MainForm : Form
    {
        private readonly WebApplication _webApp;
        private readonly string _startUrl;
        private WebView2? _webView;

        public MainForm(WebApplication webApp, string startUrl)
        {
            _webApp = webApp;
            _startUrl = startUrl;

            // Form properties
            this.Text = "PIMS - Project Information Management System";
            this.Size = new Size(1366, 850);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.MinimumSize = new Size(1024, 700);
            this.WindowState = FormWindowState.Maximized;

            InitializeWebView();
        }

        private async void InitializeWebView()
        {
            try
            {
                _webView = new WebView2
                {
                    Dock = DockStyle.Fill
                };

                this.Controls.Add(_webView);

                // Set user data folder for WebView2 in LocalApplicationData to prevent permission errors
                string userPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "PimsApp", "WebView2Data");
                var env = await Microsoft.Web.WebView2.Core.CoreWebView2Environment.CreateAsync(null, userPath);
                
                await _webView.EnsureCoreWebView2Async(env);
                
                // Configure browser settings
                _webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
                
                // Navigate to the ASP.NET Core local host address
                _webView.Source = new Uri(_startUrl);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to initialize WebView2: {ex.Message}\nMake sure the Microsoft Edge WebView2 Runtime is installed.", "Initialization Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
